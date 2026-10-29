"use client";

import { useEffect, useState, useTransition } from "react";
import { Bell, BellRing, Check, ChevronDown, Eye, EyeOff, Loader2, Mail, MessageCircle, Send, Volume2, VolumeX } from "lucide-react";
import clsx from "clsx";
import { Btn, Card, Field, inputCls, Toggle } from "./ui";
import { chime, soundOn, setSoundOn } from "./LiveAlerts";
import { findTelegramChat, saveNotifications, testNotification } from "@/lib/admin-actions";
import type { NotifyConfig } from "@/lib/types";

const EVENTS: { id: keyof NotifyConfig["events"]; label: string }[] = [
  { id: "orders", label: "New orders" },
  { id: "quotes", label: "Quote requests" },
  { id: "samples", label: "Fabric samples" },
  { id: "messages", label: "Messages" },
];

type Channel = "telegram" | "whatsapp" | "email";
type Result = { ok: boolean; text: string } | null;

function Secret({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input type={show ? "text" : "password"} autoComplete="off" spellCheck={false} className={clsx(inputCls, "pe-10 font-mono text-[0.8rem]")} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      <button type="button" onClick={() => setShow(!show)} className="absolute inset-y-0 end-0 flex w-10 items-center justify-center text-ink/40 hover:text-ink" aria-label={show ? "Hide" : "Show"}>
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function Steps({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl bg-plate/70">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-3.5 py-2.5 text-[0.8rem] font-medium text-ink/70 hover:text-ink">
        How to set it up <ChevronDown className={clsx("h-4 w-4 transition", open && "rotate-180")} />
      </button>
      {open && <ol className="list-decimal space-y-1.5 px-3.5 pb-3.5 ps-8 text-[0.8rem] leading-relaxed text-ink/70">{children}</ol>}
    </div>
  );
}

function ChannelCard({
  icon,
  name,
  tag,
  on,
  onToggle,
  children,
  onTest,
  testing,
  result,
}: {
  icon: React.ReactNode;
  name: string;
  tag: string;
  on: boolean;
  onToggle: (v: boolean) => void;
  children: React.ReactNode;
  onTest: () => void;
  testing: boolean;
  result: Result;
}) {
  return (
    <div className={clsx("flex min-w-0 flex-col gap-3 rounded-2xl border p-4 transition", on ? "border-ink/25 bg-white" : "border-line bg-white/60")}>
      <div className="flex items-center gap-3">
        <span className={clsx("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", on ? "bg-brand text-ink" : "bg-plate text-ink/50")}>{icon}</span>
        <div className="min-w-0 flex-1">
          <p className="font-medium leading-tight">{name}</p>
          <p className="text-[0.74rem] text-muted">{tag}</p>
        </div>
        <Toggle checked={on} onChange={onToggle} />
      </div>
      {children}
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
        <Btn variant="outline" className="h-9 px-4 text-[0.82rem]" onClick={onTest} disabled={testing}>
          {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Send test
        </Btn>
        {result && <p className={clsx("min-w-0 text-[0.78rem]", result.ok ? "text-emerald-700" : "text-red-600")}>{result.text}</p>}
      </div>
    </div>
  );
}

export function AlertsCard({ initial }: { initial: NotifyConfig }) {
  const [c, setC] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const [testing, setTesting] = useState<Channel | "chat" | null>(null);
  const [results, setResults] = useState<Partial<Record<Channel | "chat", Result>>>({});
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">("default");
  const [sound, setSound] = useState(true);

  useEffect(() => {
    setPerm(typeof Notification === "undefined" ? "unsupported" : Notification.permission);
    setSound(soundOn());
  }, []);

  const patch = <K extends Channel>(k: K, v: Partial<NotifyConfig[K]>) => setC((x) => ({ ...x, [k]: { ...x[k], ...v } }));
  const save = () =>
    start(async () => {
      await saveNotifications(c);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    });
  const test = async (ch: Channel) => {
    setTesting(ch);
    setResults((r) => ({ ...r, [ch]: null }));
    const res = await testNotification(ch, c).catch((e) => ({ ok: false as const, error: String(e) }));
    setResults((r) => ({ ...r, [ch]: res.ok ? { ok: true, text: "Sent — check your phone." } : { ok: false, text: res.error } }));
    setTesting(null);
  };
  const findChat = async () => {
    setTesting("chat");
    const res = await findTelegramChat(c.telegram.token);
    if (res.ok) patch("telegram", { chatId: res.chatId });
    setResults((r) => ({ ...r, chat: res.ok ? { ok: true, text: `Found ${res.name}.` } : { ok: false, text: res.error } }));
    setTesting(null);
  };
  const askPermission = async () => {
    if (typeof Notification === "undefined") return;
    const p = await Notification.requestPermission();
    setPerm(p);
    if (p === "granted") new Notification("TANFEEZ alerts are on", { body: "You'll be notified here when something new comes in.", icon: "/brand/favicon.svg" });
  };

  return (
    <Card className="space-y-5 lg:col-span-2" id="alerts">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-display font-semibold tracking-tight">
            <BellRing className="h-4 w-4" /> Order alerts
          </h2>
          <p className="mt-1 max-w-xl text-sm text-muted">Hear about it the moment a customer orders, asks for a quote, requests samples or sends a message.</p>
        </div>
        <Btn variant="dark" onClick={save} disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : saved && <Check className="h-4 w-4" />}
          {saved ? "Saved" : "Save alerts"}
        </Btn>
      </div>

      <div>
        <p className="mb-2 text-[0.8rem] font-medium text-muted">Alert me about</p>
        <div className="flex flex-wrap gap-2">
          {EVENTS.map((e) => {
            const on = c.events[e.id];
            return (
              <button key={e.id} type="button" onClick={() => setC((x) => ({ ...x, events: { ...x.events, [e.id]: !on } }))} className={clsx("inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition", on ? "bg-ink text-white" : "bg-white text-ink/50 ring-1 ring-line hover:text-ink")}>
                {on && <Check className="h-3.5 w-3.5" />} {e.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl bg-band p-4 xl:flex-row xl:items-center">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">On this computer</p>
          <p className="mt-0.5 text-[0.8rem] text-muted">While the admin is open, new activity pops up with a soft chime and a count in the browser tab. No setup needed.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Btn
            variant="outline"
            className="h-9 px-4 text-[0.82rem]"
            onClick={() => {
              setSound(!sound);
              setSoundOn(!sound);
              if (!sound) chime();
            }}
          >
            {sound ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />} Sound {sound ? "on" : "off"}
          </Btn>
          {perm === "granted" ? (
            <span className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-[0.82rem] font-medium text-emerald-700 ring-1 ring-line">
              <Check className="h-3.5 w-3.5" /> Desktop notifications on
            </span>
          ) : perm === "denied" ? (
            <span className="text-[0.78rem] text-muted">Notifications are blocked for this site in your browser settings.</span>
          ) : perm === "default" ? (
            <Btn variant="dark" className="h-9 px-4 text-[0.82rem]" onClick={askPermission}>
              <Bell className="h-3.5 w-3.5" /> Turn on desktop notifications
            </Btn>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        <ChannelCard icon={<Send className="h-4 w-4" />} name="Telegram" tag="Free · instant · recommended" on={c.telegram.on} onToggle={(on) => patch("telegram", { on })} onTest={() => test("telegram")} testing={testing === "telegram"} result={results.telegram ?? null}>
          <Field label="Bot token"><Secret value={c.telegram.token} onChange={(token) => patch("telegram", { token })} placeholder="123456:ABC-…" /></Field>
          <Field label="Chat ID">
            <div className="flex gap-2">
              <input className={clsx(inputCls, "min-w-0 font-mono text-[0.8rem]")} value={c.telegram.chatId} onChange={(e) => patch("telegram", { chatId: e.target.value })} placeholder="Tap Find →" />
              <Btn variant="outline" className="h-auto shrink-0 rounded-xl px-3 text-[0.8rem]" onClick={findChat} disabled={!c.telegram.token.trim() || testing === "chat"}>
                {testing === "chat" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Find"}
              </Btn>
            </div>
          </Field>
          {results.chat && <p className={clsx("-mt-1 text-[0.78rem]", results.chat.ok ? "text-emerald-700" : "text-red-600")}>{results.chat.text}</p>}
          <Steps>
            <li>In Telegram, open <b>@BotFather</b>, send <code>/newbot</code> and give it a name (e.g. TANFEEZ Orders).</li>
            <li>Copy the token it sends you and paste it above.</li>
            <li>Open your new bot and tap <b>Start</b>. For the whole team, add the bot to a group and send one message there.</li>
            <li>Tap <b>Find</b> to fill in the chat ID, then <b>Send test</b>.</li>
          </Steps>
          <p className="text-[0.74rem] text-faint">Alerts come with buttons to open the order and WhatsApp the customer.</p>
        </ChannelCard>

        <ChannelCard icon={<MessageCircle className="h-4 w-4" />} name="WhatsApp" tag="Free · to your own number" on={c.whatsapp.on} onToggle={(on) => patch("whatsapp", { on })} onTest={() => test("whatsapp")} testing={testing === "whatsapp"} result={results.whatsapp ?? null}>
          <Field label="Your WhatsApp number"><input className={inputCls} value={c.whatsapp.phone} onChange={(e) => patch("whatsapp", { phone: e.target.value })} placeholder="+971 50 123 4567" inputMode="tel" /></Field>
          <Field label="CallMeBot API key"><Secret value={c.whatsapp.apiKey} onChange={(apiKey) => patch("whatsapp", { apiKey })} placeholder="123456" /></Field>
          <Steps>
            <li>
              Open <a className="underline" href="https://www.callmebot.com/blog/free-api-whatsapp-messages/" target="_blank" rel="noreferrer">CallMeBot&rsquo;s WhatsApp page</a> and save the number it lists in your phone&rsquo;s contacts.
            </li>
            <li>From the WhatsApp number above, send it: <i>I allow callmebot to send me messages</i></li>
            <li>Paste the API key it replies with, then <b>Send test</b>.</li>
          </Steps>
          <p className="text-[0.74rem] text-faint">A free community service, not official WhatsApp Business — good for alerts to yourself; it can&rsquo;t message customers. Each number needs its own key.</p>
        </ChannelCard>

        <ChannelCard icon={<Mail className="h-4 w-4" />} name="Email" tag="Via Resend · 3,000 free a month" on={c.email.on} onToggle={(on) => patch("email", { on })} onTest={() => test("email")} testing={testing === "email"} result={results.email ?? null}>
          <Field label="Resend API key"><Secret value={c.email.apiKey} onChange={(apiKey) => patch("email", { apiKey })} placeholder="re_…" /></Field>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <Field label="From"><input className={inputCls} value={c.email.from} onChange={(e) => patch("email", { from: e.target.value })} placeholder="TANFEEZ <orders@your-domain>" /></Field>
            <Field label="Send alerts to" hint="comma-separated"><input className={inputCls} value={c.email.to} onChange={(e) => patch("email", { to: e.target.value })} placeholder="sales@…, owner@…" /></Field>
          </div>
          <Toggle checked={c.email.receipts} onChange={(receipts) => patch("email", { receipts })} label="Also email customers an order confirmation" />
          <Steps>
            <li>Create a free account at <a className="underline" href="https://resend.com" target="_blank" rel="noreferrer">resend.com</a> and make an API key.</li>
            <li>To try it straight away, use <code>onboarding@resend.dev</code> as From and send alerts to the email you signed up with.</li>
            <li>To email anyone else — and for customer confirmations — add and verify your domain in Resend, then use an address on it as From.</li>
          </Steps>
        </ChannelCard>
      </div>
      <p className="text-[0.78rem] text-faint">Keys are stored with your admin settings and never shown on the website. Remember to save after changing anything.</p>
    </Card>
  );
}
