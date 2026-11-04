"use client";

import { useState, useTransition } from "react";
import { Check, Copy, CreditCard, Link2, Loader2, PlugZap } from "lucide-react";
import clsx from "clsx";
import { Btn, Card, Field, inputCls, PageHeader, Toggle } from "./ui";
import { Secret, Steps } from "./AlertsCard";
import { connectPaymentWebhook, savePayments, testPaymentConnection } from "@/lib/admin-actions";
import type { GatewayProvider, PaymentsConfig } from "@/lib/types";

type Msg = { ok: boolean; text: string } | null;

export function PaymentsSettings({ initial, siteUrl, hooks }: { initial: PaymentsConfig; siteUrl: string; hooks: { tabby: boolean; ziina: boolean } }) {
  const [c, setC] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Record<string, Msg>>({});
  const [connected, setConnected] = useState(hooks);
  const live = c.mode === "live";

  const patch = <K extends "tabby" | "tamara" | "ziina">(k: K, v: Partial<PaymentsConfig[K]>) => setC((x) => ({ ...x, [k]: { ...x[k], ...v } }));
  const save = () =>
    start(async () => {
      await savePayments(c);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    });
  const test = async (p: GatewayProvider) => {
    setBusy(`test-${p}`);
    const r = await testPaymentConnection(p, c);
    setMsgs((m) => ({ ...m, [p]: { ok: r.ok, text: r.message } }));
    setBusy(null);
  };
  const hook = async (p: "tabby" | "ziina") => {
    setBusy(`hook-${p}`);
    const r = await connectPaymentWebhook(p, c);
    setMsgs((m) => ({ ...m, [`hook-${p}`]: { ok: r.ok, text: r.message } }));
    if (r.ok) setConnected((x) => ({ ...x, [p]: true }));
    setBusy(null);
  };

  // Plain render helpers (not components), so the buttons stay mounted while results come in.
  const result = (k: string) => (msgs[k] ? <p className={clsx("text-[0.78rem]", msgs[k]!.ok ? "text-emerald-700" : "text-red-600")}>{msgs[k]!.text}</p> : null);
  const testBtn = (p: GatewayProvider) => (
    <Btn variant="outline" className="h-9 px-4 text-[0.82rem]" onClick={() => test(p)} disabled={busy === `test-${p}`}>
      {busy === `test-${p}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlugZap className="h-3.5 w-3.5" />} Test connection
    </Btn>
  );

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Payments"
        sub="Take payments online with Tabby, Tamara and cards (Ziina). The money goes straight to TANFEEZ's accounts with each provider."
        actions={
          <Btn variant="dark" onClick={save} disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : saved && <Check className="h-4 w-4" />}
            {saved ? "Saved" : "Save payments"}
          </Btn>
        }
      />

      <Card className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <p className="font-medium">Mode</p>
          <p className="mt-0.5 text-sm text-muted">
            {live ? "Live: real customers, real money." : "Test: use the providers' test (sandbox) keys and test cards. Nothing is charged."} Keys must match the mode.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-1 rounded-full bg-plate p-1 text-sm">
          {(["test", "live"] as const).map((m) => (
            <button key={m} onClick={() => setC((x) => ({ ...x, mode: m }))} className={clsx("h-9 rounded-full px-5 font-medium transition", c.mode === m ? (m === "live" ? "bg-emerald-600 text-white" : "bg-white text-ink shadow-sm") : "text-ink/55 hover:text-ink")}>
              {m === "test" ? "Test" : "Live"}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        {/* Tabby */}
        <Provider name="Tabby" tag="Pay in 4 · interest-free" tint="#3BFFC1" on={c.tabby.on} onToggle={(on) => patch("tabby", { on })}>
          <Field label="Secret key"><Secret value={c.tabby.secretKey} onChange={(secretKey) => patch("tabby", { secretKey })} placeholder={live ? "sk_…" : "sk_test_…"} /></Field>
          <Field label="Public key" hint="optional"><input className={clsx(inputCls, "font-mono text-[0.8rem]")} value={c.tabby.publicKey} onChange={(e) => patch("tabby", { publicKey: e.target.value })} placeholder={live ? "pk_…" : "pk_test_…"} /></Field>
          <Field label="Merchant code"><input className={clsx(inputCls, "font-mono text-[0.8rem]")} value={c.tabby.merchantCode} onChange={(e) => patch("tabby", { merchantCode: e.target.value })} placeholder="e.g. TANFEEZAE" /></Field>
          <div className="flex flex-wrap gap-2">
            {testBtn("tabby")}
            <Btn variant="outline" className="h-9 px-4 text-[0.82rem]" onClick={() => hook("tabby")} disabled={busy === "hook-tabby"}>
              {busy === "hook-tabby" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : connected.tabby ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
              {connected.tabby ? "Webhook connected" : "Connect webhook"}
            </Btn>
          </div>
          {result("tabby")}
          {result("hook-tabby")}
          <Steps>
            <li>Tabby sends you the keys and merchant code after approval (test ones first).</li>
            <li>Paste them, keep the mode on <b>Test</b>, save, and press <b>Connect webhook</b>.</li>
            <li>Place a test order with <code>otp.success@tabby.ai</code>, mobile <code>+971500000001</code>, OTP <code>8888</code>.</li>
            <li>When Tabby approves the integration, switch to live keys and <b>Live</b> mode, then connect the webhook again.</li>
          </Steps>
        </Provider>

        {/* Tamara */}
        <Provider name="Tamara" tag="Pay in 3 · interest-free" tint="#F3C6A5" on={c.tamara.on} onToggle={(on) => patch("tamara", { on })}>
          <Field label="API token"><Secret value={c.tamara.apiToken} onChange={(apiToken) => patch("tamara", { apiToken })} placeholder="eyJ…" /></Field>
          <Field label="Notification token"><Secret value={c.tamara.notificationToken} onChange={(notificationToken) => patch("tamara", { notificationToken })} placeholder="eyJ…" /></Field>
          <Field label="Public key" hint="optional"><input className={clsx(inputCls, "font-mono text-[0.8rem]")} value={c.tamara.publicKey} onChange={(e) => patch("tamara", { publicKey: e.target.value })} /></Field>
          <div className="flex flex-wrap gap-2">{testBtn("tamara")}</div>
          {result("tamara")}
          <CopyRow label="Webhook URL for the Tamara Partner Portal" value={`${siteUrl}/api/payments/tamara`} />
          <Steps>
            <li>Paste the API token and notification token from Tamara, keep <b>Test</b> mode, and save.</li>
            <li>In the Tamara Partner Portal go to <b>Settings → General settings → Webhooks → Add webhook</b>, type <b>Order</b>, tick all events, and paste the URL above.</li>
            <li>Test with any UAE mobile like <code>+971 50 1xx xxxx</code> and the code shown on the sandbox screen.</li>
            <li>Once Tamara approves, paste the live tokens and switch to <b>Live</b>.</li>
          </Steps>
        </Provider>

        {/* Ziina */}
        <Provider name="Ziina" tag="Cards, Apple Pay & Google Pay" tint="#1a1a1a" dark on={c.ziina.on} onToggle={(on) => patch("ziina", { on })}>
          <Field label="API key"><Secret value={c.ziina.apiKey} onChange={(apiKey) => patch("ziina", { apiKey })} placeholder="Ziina API token" /></Field>
          <div className="flex flex-wrap gap-2">
            {testBtn("ziina")}
            <Btn variant="outline" className="h-9 px-4 text-[0.82rem]" onClick={() => hook("ziina")} disabled={busy === "hook-ziina"}>
              {busy === "hook-ziina" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : connected.ziina ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
              {connected.ziina ? "Webhook connected" : "Connect webhook"}
            </Btn>
          </div>
          {result("ziina")}
          {result("hook-ziina")}
          <Steps>
            <li>In the Ziina business app or dashboard, create an API key with payment, refund and webhook permissions.</li>
            <li>Paste it, save, and press <b>Connect webhook</b>.</li>
            <li>In <b>Test</b> mode payments are simulated; use Ziina&rsquo;s test cards. Switch to <b>Live</b> to charge real cards.</li>
          </Steps>
        </Provider>
      </div>

      <Card className="mt-4 text-sm text-muted">
        <p className="font-medium text-ink">How it works</p>
        <ul className="mt-2 list-disc space-y-1 ps-5">
          <li>Customers are sent to the provider&rsquo;s secure page and come back to the website. An order only counts as paid once the provider confirms it.</li>
          <li>Tabby and Tamara approve first. The money is captured when you set the order to <b>Out for delivery</b>, or with the Capture button on the order.</li>
          <li>Cancelling an approved order releases the approval. Refunds (full or partial) are on each order page.</li>
          <li>A provider you leave off, or without keys, keeps working the old way: the order comes in and your team arranges payment.</li>
        </ul>
      </Card>
    </div>
  );
}

function Provider({ name, tag, tint, dark, on, onToggle, children }: { name: string; tag: string; tint: string; dark?: boolean; on: boolean; onToggle: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <Card className={clsx("flex min-w-0 flex-col gap-3 transition", on ? "!border-ink/25" : "")}>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[0.95rem] font-bold" style={{ background: tint, color: dark ? "#fff" : "#1a1a1a" }}>
          {name === "Ziina" ? <CreditCard className="h-4 w-4" /> : name.charAt(0)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display font-semibold">{name}</p>
          <p className="text-[0.76rem] text-muted">{tag}</p>
        </div>
        <Toggle checked={on} onChange={onToggle} />
      </div>
      {children}
    </Card>
  );
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <p className="mb-1 text-[0.78rem] font-medium text-muted">{label}</p>
      <div className="flex gap-2">
        <input readOnly value={value} className={clsx(inputCls, "min-w-0 font-mono text-[0.75rem]")} onFocus={(e) => e.currentTarget.select()} />
        <Btn variant="outline" className="h-auto shrink-0 rounded-xl px-3" onClick={() => navigator.clipboard.writeText(value).then(() => setCopied(true))} aria-label="Copy">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </Btn>
      </div>
    </div>
  );
}
