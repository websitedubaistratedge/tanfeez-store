"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, RotateCcw } from "lucide-react";
import { Btn, Card, Field, inputCls, PageHeader } from "./ui";
import { resetDemoData, saveSettings } from "@/lib/admin-actions";
import type { Settings } from "@/lib/types";

export function SettingsForm({ settings }: { settings: Settings }) {
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
        sub="Contact details, delivery fees and store messaging shown across the website."
        actions={<Btn variant="brand" onClick={save} disabled={pending}>{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : saved && <Check className="h-4 w-4" />}{saved ? "Saved" : "Save settings"}</Btn>}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-4">
          <h2 className="font-extrabold">Contact</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone"><input className={inputCls} value={s.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
            <Field label="Mobile"><input className={inputCls} value={s.mobile} onChange={(e) => set("mobile", e.target.value)} /></Field>
            <Field label="WhatsApp" hint="digits only"><input className={inputCls} value={s.whatsapp} onChange={(e) => set("whatsapp", e.target.value.replace(/\D/g, ""))} /></Field>
            <Field label="Email"><input className={inputCls} value={s.email} onChange={(e) => set("email", e.target.value)} /></Field>
            <Field label="Instagram handle" className="col-span-2"><input className={inputCls} value={s.instagram} onChange={(e) => set("instagram", e.target.value)} /></Field>
          </div>
          <Field label="Address (EN)"><input className={inputCls} value={s.address.en} onChange={(e) => set("address", { ...s.address, en: e.target.value })} /></Field>
          <Field label="Address (AR)"><input dir="rtl" className={inputCls} value={s.address.ar} onChange={(e) => set("address", { ...s.address, ar: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Hours (EN)"><input className={inputCls} value={s.hours.en} onChange={(e) => set("hours", { ...s.hours, en: e.target.value })} /></Field>
            <Field label="Hours (AR)"><input dir="rtl" className={inputCls} value={s.hours.ar} onChange={(e) => set("hours", { ...s.hours, ar: e.target.value })} /></Field>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="space-y-4">
            <h2 className="font-extrabold">Store announcement</h2>
            <Field label="English"><input className={inputCls} value={s.announcement.en} onChange={(e) => set("announcement", { ...s.announcement, en: e.target.value })} /></Field>
            <Field label="Arabic"><input dir="rtl" className={inputCls} value={s.announcement.ar} onChange={(e) => set("announcement", { ...s.announcement, ar: e.target.value })} /></Field>
          </Card>
          <Card className="space-y-4">
            <h2 className="font-extrabold">Delivery &amp; installation fees (AED)</h2>
            <Field label="Free delivery in Dubai over"><input type="number" className={inputCls} value={s.freeDeliveryOver} onChange={(e) => set("freeDeliveryOver", Number(e.target.value))} /></Field>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(s.deliveryFees).map(([k, v]) => (
                <Field key={k} label={k}><input type="number" min={0} className={inputCls} value={v} onChange={(e) => set("deliveryFees", { ...s.deliveryFees, [k]: Number(e.target.value) })} /></Field>
              ))}
            </div>
          </Card>
          <Card className="space-y-4">
            <h2 className="font-extrabold">Bank transfer details</h2>
            <Field label="Bank"><input className={inputCls} value={s.bank.name} onChange={(e) => set("bank", { ...s.bank, name: e.target.value })} /></Field>
            <Field label="Account name"><input className={inputCls} value={s.bank.account} onChange={(e) => set("bank", { ...s.bank, account: e.target.value })} /></Field>
            <Field label="IBAN"><input className={inputCls} value={s.bank.iban} onChange={(e) => set("bank", { ...s.bank, iban: e.target.value })} /></Field>
          </Card>
          <Card className="space-y-3 !bg-ink-950 text-white">
            <h2 className="font-extrabold">Demo data</h2>
            <p className="text-sm text-white/60">Restore the original catalogue, projects, orders and requests. Everything you added will be removed.</p>
            <Btn variant="brand" onClick={() => confirm("Reset all demo data?") && start(async () => { await resetDemoData(); location.reload(); })}>
              <RotateCcw className="h-4 w-4" /> Reset demo data
            </Btn>
          </Card>
        </div>
      </div>
    </div>
  );
}
