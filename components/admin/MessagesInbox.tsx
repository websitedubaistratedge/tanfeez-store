"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Inbox, Mail, MailOpen, Phone, Reply, Trash2 } from "lucide-react";
import clsx from "clsx";
import { Btn, Card, PageHeader, ago, fmtDateTime } from "./ui";
import { deleteMessage, markMessage } from "@/lib/admin-actions";
import type { Message } from "@/lib/types";

export function MessagesInbox({ messages }: { messages: Message[] }) {
  const [sel, setSel] = useState<string | null>(messages[0]?.id ?? null);
  const [, start] = useTransition();
  const m = messages.find((x) => x.id === sel);
  const open = (x: Message) => {
    setSel(x.id);
    if (!x.read) start(() => markMessage(x.id, true));
  };

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Messages" sub={`${messages.filter((x) => !x.read).length} unread · contact form & newsletter`} />
      {messages.length === 0 ? (
        <Card className="flex flex-col items-center py-16 text-ink/50"><Inbox className="mb-3 h-10 w-10" /> Inbox zero.</Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
          <Card className="!p-0 max-h-[70vh] overflow-y-auto">
            <ul>
              {messages.map((x) => (
                <li key={x.id}>
                  <button onClick={() => open(x)} className={clsx("flex w-full gap-3 border-b border-ink/5 p-4 text-left transition", sel === x.id ? "bg-brand-50" : "hover:bg-sand/60")}>
                    <span className={clsx("mt-1.5 h-2 w-2 shrink-0 rounded-full", x.read ? "bg-transparent" : "bg-brand-600")} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className={clsx("truncate", x.read ? "font-semibold" : "font-black")}>{x.name}</span>
                        <span className="shrink-0 text-xs text-ink/40">{ago(x.createdAt)}</span>
                      </span>
                      <span className="block truncate text-sm font-semibold text-ink/70">{x.subject}</span>
                      <span className="block truncate text-xs text-ink/45">{x.message}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </Card>
          <AnimatePresence mode="wait">
            {m && (
              <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Card className="min-h-[300px]">
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink/5 pb-4">
                    <div>
                      <h2 className="text-xl font-black">{m.subject}</h2>
                      <p className="mt-1 text-sm text-ink/60">{m.name} · <a href={`mailto:${m.email}`} className="underline">{m.email}</a>{m.phone && <> · <a href={`tel:${m.phone}`} className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{m.phone}</a></>}</p>
                      <p className="text-xs text-ink/40">{fmtDateTime(m.createdAt)}</p>
                    </div>
                    <div className="flex gap-2">
                      <a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + m.subject)}`} className="inline-flex h-10 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-bold text-white"><Reply className="h-4 w-4" /> Reply</a>
                      <Btn variant="outline" onClick={() => start(() => markMessage(m.id, !m.read))}>{m.read ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}{m.read ? "Mark unread" : "Mark read"}</Btn>
                      <Btn variant="danger" onClick={() => confirm("Delete this message?") && start(async () => { await deleteMessage(m.id); setSel(null); })}><Trash2 className="h-4 w-4" /></Btn>
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap pt-5 leading-relaxed">{m.message}</p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
