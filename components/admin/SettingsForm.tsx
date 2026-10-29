"use client";

import { useState, useTransition } from "react";
import { Check, Eraser, Loader2, RotateCcw } from "lucide-react";
import { Btn, Card, Field, inputCls, PageHeader } from "./ui";
import { AlertsCard } from "./AlertsCard";
import { clearDemoActivity, resetDemoData, saveSettings } from "@/lib/admin-actions";
import type { NotifyConfig, Settings } from "@/lib/types";

export function SettingsForm({ settings, notify }: { settings: Settings; notify: NotifyConfig }) {
  const [s, setS] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS((x) => ({ ...x, [k]: v }));
  const save = () =>
    start(async () => {
      await saveSettings(s);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    });

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Settings"
        sub="Order alerts, contact details, delivery fees and store messaging."
        actions={<Btn variant="brand" onClick={save} disabled={pending}>{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : saved && <Check className="h-4 w-4" />}{saved ? "Saved" : "Save settings"}</Btn>}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <AlertsCard initial={notify} />
        <Card className="space-y-4">
          <h2 className="font-display font-semibold tracking-tight">Contact</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Phone"><input className={inputCls} value={s.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
            <Field label="Mobile"><input className={inputCls} value={s.mobile} onChange={(e) => set("mobile", e.target.value)} /></Field>
            <Field label="WhatsApp" hint="digits only"><input className={inputCls} value={s.whatsapp} onChange={(e) => set("whatsapp", e.target.value.replace(/\D/g, ""))} /></Field>
            <Field label="Email"><input className={inputCls} value={s.email} onChange={(e) => set("email", e.target.value)} /></Field>
            <Field label="Instagram handle" className="col-span-2"><input className={inputCls} value={s.instagram} onChange={(e) => set("instagram", e.target.value)} /></Field>
          </div>
          <Field label="Address (EN)"><input className={inputCls} value={s.address.en} onChange={(e) => set("address", { ...s.address, en: e.target.value })} /></Field>
          <Field label="Address (AR)"><input dir="rtl" className={inputCls} value={s.address.ar} onChange={(e) => set("address", { ...s.address, ar: e.target.value })} /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Hours (EN)"><input className={inputCls} value={s.hours.en} onChange={(e) => set("hours", { ...s.hours, en: e.target.value })} /></Field>
            <Field label="Hours (AR)"><input dir="rtl" className={inputCls} value={s.hours.ar} onChange={(e) => set("hours", { ...s.hours, ar: e.target.value })} /></Field>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="space-y-4">
            <h2 className="font-display font-semibold tracking-tight">Store announcement</h2>
            <Field label="English"><input className={inputCls} value={s.announcement.en} onChange={(e) => set("announcement", { ...s.announcement, en: e.target.value })} /></Field>
            <Field label="Arabic"><input dir="rtl" className={inputCls} value={s.announcement.ar} onChange={(e) => set("announcement", { ...s.announcement, ar: e.target.value })} /></Field>
          </Card>
          <Card className="space-y-4">
            <h2 className="font-display font-semibold tracking-tight">Delivery &amp; installation fees (AED)</h2>
            <Field label="Free delivery in Dubai over"><input type="number" className={inputCls} value={s.freeDeliveryOver} onChange={(e) => set("freeDeliveryOver", Number(e.target.value))} /></Field>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(s.deliveryFees).map(([k, v]) => (
                <Field key={k} label={k}><input type="number" min={0} className={inputCls} value={v} onChange={(e) => set("deliveryFees", { ...s.deliveryFees, [k]: Number(e.target.value) })} /></Field>
              ))}
            </div>
          </Card>
          <Card className="space-y-4">
            <h2 className="font-display font-semibold tracking-tight">Bank transfer details</h2>
            <Field label="Bank"><input className={inputCls} value={s.bank.name} onChange={(e) => set("bank", { ...s.bank, name: e.target.value })} /></Field>
            <Field label="Account name"><input className={inputCls} value={s.bank.account} onChange={(e) => set("bank", { ...s.bank, account: e.target.value })} /></Field>
            <Field label="IBAN"><input className={inputCls} value={s.bank.iban} onChange={(e) => set("bank", { ...s.bank, iban: e.target.value })} /></Field>
          </Card>
          <Card className="space-y-4 !border-transparent !bg-band">
            <div>
              <h2 className="font-display font-semibold tracking-tight">Demo data</h2>
              <p className="mt-1 text-sm text-muted">The sample orders, quote requests and messages that came with the website.</p>
            </div>
            <div className="border-t border-ink/10 pt-4">
              <p className="text-sm font-medium">Going live?</p>
              <p className="mt-0.5 text-sm text-muted">Remove the sample orders, requests and messages. Your products, projects and settings stay as they are.</p>
              <Btn
                variant="dark"
                className="mt-3"
                onClick={() =>
                  confirm("Remove all sample orders, quote requests and messages? Real ones are kept.") &&
                  start(async () => {
                    const n = await clearDemoActivity();
                    alert(`${n} sample records removed.`);
                    location.reload();
                  })
                }
              >
                <Eraser className="h-4 w-4" /> Remove demo orders &amp; requests
              </Btn>
            </div>
            <div className="border-t border-ink/10 pt-4">
              <p className="text-sm font-medium">Start the demo over</p>
              <p className="mt-0.5 text-sm text-muted">Restore the original catalogue, projects, orders and requests. Everything you added is removed.</p>
              <Btn variant="outline" className="mt-3" onClick={() => confirm("Reset everything to the original demo? Everything you added will be removed.") && start(async () => { await resetDemoData(); location.reload(); })}>
                <RotateCcw className="h-4 w-4" /> Reset all demo data
              </Btn>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
