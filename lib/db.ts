import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import type { DB } from "./types";

// Demo persistence: a single JSON file behind a serialized write queue.
// Swap this module for Postgres/Prisma in production; the rest of the app
// only talks to readDB() and mutate().

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const SEED_FILE = path.join(DATA_DIR, "seed.json");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

let queue: Promise<unknown> = Promise.resolve();

async function ensure() {
  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.copyFile(SEED_FILE, DB_FILE);
  }
}

export async function readDB(): Promise<DB> {
  await queue.catch(() => {});
  await ensure();
  return JSON.parse(await fs.readFile(DB_FILE, "utf8")) as DB;
}

export function mutate<T>(fn: (db: DB) => T | Promise<T>): Promise<T> {
  const run = async () => {
    await ensure();
    const db = JSON.parse(await fs.readFile(DB_FILE, "utf8")) as DB;
    const result = await fn(db);
    const tmp = DB_FILE + "." + process.pid + ".tmp";
    await fs.writeFile(tmp, JSON.stringify(db, null, 1));
    await fs.rename(tmp, DB_FILE);
    return result;
  };
  const p = queue.then(run, run);
  queue = p.catch(() => {});
  return p;
}

export async function resetDB() {
  await queue.catch(() => {});
  await fs.copyFile(SEED_FILE, DB_FILE);
}

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
