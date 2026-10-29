"use client";

import { useOptimistic, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, Calendar, FileText, Mail, MapPin, MessageCircle, Phone, Ruler, Trash2, Wallet, X, Clock } from "lucide-react";
import clsx from "clsx";
import { Btn, PageHeader, REQ_LABEL, REQ_TONE, SERVICE_LABEL, aed, ago, fmtDateTime, inputCls } from "./ui";
import { deleteRequest, updateRequest } from "@/lib/admin-actions";
import type { QuoteRequest, RequestStatus } from "@/lib/types";

const COLS: RequestStatus[] = ["new", "contacted", "visit", "quoted", "won", "lost"];

export function RequestsBoard({ requests, openId }: { requests: QuoteRequest[]; openId?: string }) {
  const [, start] = useTransition();
  const [items, move] = useOptimistic(requests, (state, { id, status }: { id: string; status: RequestStatus }) =>
    state.map((r) => (r.id === id ? { ...r, status } : r))
  );
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<RequestStatus | null>(null);
  const [selected, setSelected] = useState<string | null>(openId ?? null);
  const sel = items.find((r) => r.id === selected) ?? null;

  const drop = (status: RequestStatus) => {
    if (!dragId) return;
    const id = dragId;
    setDragId(null);
    setOver(null);
    start(async () => {
      move({ id, status });
      await updateRequest(id, { status });
    });
  };

  const won = items.filter((r) => r.status === "won").reduce((s, r) => s + (r.value ?? 0), 0);

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader title="Quote requests" sub={`Drag cards between stages · ${aed(won)} won`} />
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-4 md:-mx-8 md:px-8">
        {COLS.map((col) => {
          const list = items.filter((r) => r.status === col);
          return (
            <div
              key={col}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(col);
              }}
              onDragLeave={() => setOver((o) => (o === col ? null : o))}
              onDrop={() => drop(col)}
              className={clsx("flex w-72 shrink-0 flex-col rounded-[20px] p-3 transition", over === col ? "bg-brand-50 ring-2 ring-brand" : "bg-ink/[0.04]")}
            >
              <div className="mb-3 flex items-center gap-2 px-1">
                <span className={clsx("h-2.5 w-2.5 rounded-full", REQ_TONE[col])} />
                <h2 className="text-sm font-extrabold">{REQ_LABEL[col]}</h2>
                <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-xs font-bold text-ink/60">{list.length}</span>
              </div>
              <div className="flex min-h-[120px] flex-1 flex-col gap-2">
                <AnimatePresence>
                  {list.map((r) => (
                    <motion.button
                      layout
                      layoutId={r.id}
                      key={r.id}
                      draggable
                      onDragStart={() => setDragId(r.id)}
                      onDragEnd={() => setDragId(null)}
                      onClick={() => setSelected(r.id)}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: dragId === r.id ? 0.4 : 1, scale: 1 }}
                      className="cursor-grab rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-ink/5 transition hover:shadow-md active:cursor-grabbing"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-ink/40">{r.number}</span>
                        <span className="rounded-full bg-sand px-2 py-0.5 text-[11px] font-bold">{SERVICE_LABEL[r.service]}</span>
                      </div>
                      <p className="mt-2 font-bold leading-tight">{r.contact.company || r.contact.name}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-ink/55">{r.details}</p>
                      <div className="mt-3 flex items-center gap-3 text-[11px] font-semibold text-ink/50">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{r.emirate}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{ago(r.createdAt)}</span>
                        {r.value ? <span className="ml-auto font-black text-ink">{aed(r.value)}</span> : null}
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>{sel && <Panel key={sel.id} r={sel} onClose={() => setSelected(null)} onStatus={(s) => start(async () => { move({ id: sel.id, status: s }); await updateRequest(sel.id, { status: s }); })} />}</AnimatePresence>
    </div>
  );
}

function Panel({ r, onClose, onStatus }: { r: QuoteRequest; onClose: () => void; onStatus: (s: RequestStatus) => void }) {
  const [note, setNote] = useState("");
  const [value, setValue] = useState(r.value ? String(r.value) : "");
  const [pending, start] = useTransition();
  const phone = r.contact.phone.replace(/[^\d]/g, "");
  return (
    <div className="fixed inset-0 z-50">
      <motion.div className="absolute inset-0 bg-black/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-y-0 right-0 flex w-full max-w-lg flex-col bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-ink/5 p-6">
          <div>
            <p className="text-xs font-black text-ink/40">{r.number} · {fmtDateTime(r.createdAt)}</p>
            <h2 className="mt-1 text-2xl font-black">{r.contact.company || r.contact.name}</h2>
            <p className="text-sm text-ink/55">{SERVICE_LABEL[r.service]} · {r.space}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-ink/5" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <div className="flex flex-wrap gap-1.5">
            {COLS.map((s) => (
              <button key={s} onClick={() => onStatus(s)} className={clsx("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition", r.status === s ? "bg-ink text-white" : "bg-sand text-ink/60 hover:text-ink")}>
                <span className={clsx("h-2 w-2 rounded-full", REQ_TONE[s])} /> {REQ_LABEL[s]}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { Icon: MapPin, k: "Emirate", v: r.emirate },
              { Icon: Ruler, k: "Area", v: r.area ? `${r.area} m²` : "—" },
              { Icon: Wallet, k: "Budget", v: r.budget || "—" },
              { Icon: Calendar, k: "Timeline", v: r.timeline || "—" },
            ].map(({ Icon, k, v }) => (
              <div key={k} className="rounded-xl bg-sand p-3">
                <p className="flex items-center gap-1.5 text-xs font-bold text-ink/50"><Icon className="h-3.5 w-3.5" />{k}</p>
                <p className="mt-0.5 font-bold">{v}</p>
              </div>
            ))}
          </div>
          <div>
            <h3 className="mb-2 text-sm font-extrabold">Brief</h3>
            <p className="whitespace-pre-wrap rounded-xl bg-sand p-4 text-sm leading-relaxed">{r.details || "—"}</p>
            {r.product && <p className="mt-2 text-sm"><b>Product:</b> {r.product}</p>}
          </div>
          {r.files.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-extrabold">Attachments</h3>
              <ul className="flex flex-wrap gap-2">
                {r.files.map((f, i) => (
                  <li key={f}><a href={f} target="_blank" className="flex items-center gap-2 rounded-xl bg-sand px-3 py-2 text-sm font-bold hover:bg-brand-50"><FileText className="h-4 w-4" /> File {i + 1}</a></li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <h3 className="mb-2 text-sm font-extrabold">Contact</h3>
            <ul className="space-y-1.5 text-sm">
              <li className="flex items-center gap-2"><Building2 className="h-4 w-4 text-ink/40" />{r.contact.name}{r.contact.company && ` · ${r.contact.company}`}</li>
              <li><a href={`tel:${phone}`} className="flex items-center gap-2 hover:underline"><Phone className="h-4 w-4 text-ink/40" />{r.contact.phone}</a></li>
              <li><a href={`mailto:${r.contact.email}`} className="flex items-center gap-2 hover:underline"><Mail className="h-4 w-4 text-ink/40" />{r.contact.email}</a></li>
            </ul>
            <a href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex h-10 items-center gap-2 rounded-xl bg-[#25D366] px-4 text-sm font-bold text-white"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-extrabold">Quoted value (AED)</h3>
            <div className="flex gap-2">
              <input type="number" min={0} value={value} onChange={(e) => setValue(e.target.value)} className={inputCls} placeholder="e.g. 120000" />
              <Btn variant="outline" disabled={pending} onClick={() => start(() => updateRequest(r.id, { value: value ? Number(value) : null }))}>Save</Btn>
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-extrabold">Notes</h3>
            <ul className="mb-3 space-y-2">
              {r.notes.map((n, i) => (
                <li key={i} className="rounded-xl border border-ink/10 p-3 text-sm">
                  <p>{n.text}</p>
                  <p className="mt-1 text-xs text-ink/40">{fmtDateTime(n.at)}</p>
                </li>
              ))}
            </ul>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className={inputCls} placeholder="Add a note: call outcome, site visit date…" />
            <Btn className="mt-2" disabled={pending || !note.trim()} onClick={() => start(async () => { await updateRequest(r.id, { note }); setNote(""); })}>Add note</Btn>
          </div>
        </div>
        <div className="border-t border-ink/5 p-4">
          <Btn variant="danger" onClick={() => confirm(`Delete request ${r.number}?`) && start(async () => { await deleteRequest(r.id); onClose(); })}><Trash2 className="h-4 w-4" /> Delete request</Btn>
        </div>
      </motion.aside>
    </div>
  );
}
