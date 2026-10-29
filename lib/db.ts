import "server-only";
import { cache } from "react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import seed from "@/data/seed.json";
import type { DB } from "./types";

// Persistence lives in Cloudflare D1. Each catalogue/order/request record is one
// row (JSON) in `docs`, keyed by collection + id; settings and counters live in
// `meta`. The rest of the app only talks to readDB() and mutate(), which load
// the whole (small) store and write back just the rows that changed.

const COLLECTIONS = ["categories", "products", "projects", "orders", "requests", "messages"] as const;
type Coll = (typeof COLLECTIONS)[number];
type Row = { coll: Coll; id: string; pos: number; data: string };

const SCHEMA = [
  "CREATE TABLE IF NOT EXISTS docs (coll TEXT NOT NULL, id TEXT NOT NULL, pos INTEGER NOT NULL, data TEXT NOT NULL, PRIMARY KEY (coll, id))",
  "CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, data TEXT NOT NULL)",
  // Writing a row here aborts a batch: used to reject a write based on a stale read.
  "CREATE TABLE IF NOT EXISTS guard (v INTEGER CHECK (v = 0))",
];

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

async function d1(): Promise<D1Database | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return (env as CloudflareEnv).DB ?? null;
  } catch {
    return null; // e.g. type-checking or a plain Node process: fall back to seed data
  }
}

// One-off data changes for databases seeded before the change landed in data/seed.json.
// Each runs once (tracked in meta 'migrations') and must be safe to re-run.
const MIGRATIONS: { id: string; sql: [string, ...unknown[]][] }[] = [
  {
    id: "2026-10-29-full-catalogue",
    sql: [
      [
        "UPDATE docs SET data = json_set(data, '$.status', 'active') WHERE coll = 'products' AND json_extract(data, '$.slug') IN (SELECT value FROM json_each(?))",
        JSON.stringify([
          "blush-sliding-wardrobe", "understair-wine-storage", "walnut-vanity-console", "lumiere-vanity",
          "floating-oak-staircase", "black-steel-balustrade", "barn-sliding-door", "slatted-partition-console",
          "ceremony-retail-kiosk", "perfume-wall-display", "coffee-kiosk-pod",
        ]),
      ],
    ],
  },
];

async function migrate(db: D1Database) {
  const row = await db.prepare("SELECT data FROM meta WHERE key = 'migrations'").first<{ data: string }>();
  const done = new Set<string>(row ? JSON.parse(row.data) : []);
  const pending = MIGRATIONS.filter((m) => !done.has(m.id));
  if (!pending.length) return;
  pending.forEach((m) => done.add(m.id));
  await db.batch([
    ...pending.flatMap((m) => m.sql.map(([q, ...args]) => db.prepare(q).bind(...args))),
    db.prepare("INSERT OR REPLACE INTO meta (key, data) VALUES ('migrations', ?)").bind(JSON.stringify([...done])),
    db.prepare("UPDATE meta SET data = CAST(data AS INTEGER) + 1 WHERE key = 'version'"),
  ]);
}

let ready: Promise<void> | null = null;
function ensure(db: D1Database) {
  ready ??= (async () => {
    await db.batch(SCHEMA.map((s) => db.prepare(s)));
    const seeded = await db.prepare("SELECT 1 FROM meta WHERE key = 'version'").first();
    if (!seeded) await db.batch(writeAll(db, seed as unknown as DB, 0));
    await migrate(db);
  })().catch((e) => {
    ready = null;
    throw e;
  });
  return ready;
}

function rowsOf(store: DB): Row[] {
  return COLLECTIONS.flatMap((coll) =>
    (store[coll] as { id: string }[]).map((doc, pos) => ({ coll, id: doc.id, pos, data: JSON.stringify(doc) }))
  );
}

function writeAll(db: D1Database, store: DB, version: number) {
  return [
    db.prepare("DELETE FROM docs"),
    db.prepare("DELETE FROM meta"),
    ...rowsOf(store).map((r) => db.prepare("INSERT INTO docs (coll, id, pos, data) VALUES (?, ?, ?, ?)").bind(r.coll, r.id, r.pos, r.data)),
    db.prepare("INSERT INTO meta (key, data) VALUES ('settings', ?), ('counters', ?), ('version', ?)").bind(JSON.stringify(store.settings), JSON.stringify(store.counters), String(version)),
  ];
}

async function load(db: D1Database): Promise<{ store: DB; version: number }> {
  await ensure(db);
  const [docs, meta] = await db.batch<Row | { key: string; data: string }>([
    db.prepare("SELECT coll, id, pos, data FROM docs ORDER BY coll, pos"),
    db.prepare("SELECT key, data FROM meta"),
  ]);
  const store = Object.fromEntries(COLLECTIONS.map((c) => [c, [] as unknown[]])) as unknown as DB;
  for (const r of docs.results as Row[]) (store[r.coll] as unknown[]).push(JSON.parse(r.data));
  const m = Object.fromEntries((meta.results as { key: string; data: string }[]).map((r) => [r.key, r.data]));
  store.settings = JSON.parse(m.settings);
  store.counters = JSON.parse(m.counters);
  return { store, version: Number(m.version) };
}

// Without D1 (build time, scripts) the store is an in-memory copy of the seed.
let memory: DB | null = null;

// Bumped after every write so a request never re-reads data from before its own save.
let generation = 0;
const readAt = cache(async (_generation: number): Promise<DB> => {
  const db = await d1();
  if (!db) return clone((memory ??= clone(seed as unknown as DB)));
  return (await load(db)).store;
});

/** One read per request (shared by the layout and the page) until something is written. */
export const readDB = () => readAt(generation);

export async function mutate<T>(fn: (db: DB) => T | Promise<T>): Promise<T> {
  const db = await d1();
  if (!db) return fn((memory ??= clone(seed as unknown as DB)));

  for (let attempt = 0; ; attempt++) {
    const { store, version } = await load(db);
    const before = new Map(rowsOf(store).map((r) => [`${r.coll}\u0000${r.id}`, r]));
    const settingsBefore = JSON.stringify(store.settings);
    const countersBefore = JSON.stringify(store.counters);

    const result = await fn(store);

    const stmts: D1PreparedStatement[] = [
      // Abort the whole batch if someone else wrote since we read.
      db.prepare("INSERT INTO guard (v) SELECT 1 WHERE (SELECT data FROM meta WHERE key = 'version') != ?").bind(String(version)),
    ];
    const after = rowsOf(store);
    const seen = new Set<string>();
    for (const r of after) {
      const k = `${r.coll}\u0000${r.id}`;
      seen.add(k);
      const prev = before.get(k);
      if (!prev || prev.pos !== r.pos || prev.data !== r.data)
        stmts.push(db.prepare("INSERT OR REPLACE INTO docs (coll, id, pos, data) VALUES (?, ?, ?, ?)").bind(r.coll, r.id, r.pos, r.data));
    }
    for (const [k, r] of before) if (!seen.has(k)) stmts.push(db.prepare("DELETE FROM docs WHERE coll = ? AND id = ?").bind(r.coll, r.id));
    if (JSON.stringify(store.settings) !== settingsBefore) stmts.push(db.prepare("UPDATE meta SET data = ? WHERE key = 'settings'").bind(JSON.stringify(store.settings)));
    if (JSON.stringify(store.counters) !== countersBefore) stmts.push(db.prepare("UPDATE meta SET data = ? WHERE key = 'counters'").bind(JSON.stringify(store.counters)));
    if (stmts.length === 1) return result; // nothing changed
    stmts.push(db.prepare("UPDATE meta SET data = ? WHERE key = 'version'").bind(String(version + 1)));

    try {
      await db.batch(stmts);
      generation++;
      return result;
    } catch (e) {
      if (attempt >= 3 || !/CHECK constraint/i.test(String(e))) throw e;
    }
  }
}

export async function resetDB() {
  const db = await d1();
  if (!db) {
    memory = clone(seed as unknown as DB);
    return;
  }
  await ensure(db);
  const v = await db.prepare("SELECT data FROM meta WHERE key = 'version'").first<{ data: string }>();
  await db.batch(writeAll(db, seed as unknown as DB, Number(v?.data ?? 0) + 1));
  generation++;
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
