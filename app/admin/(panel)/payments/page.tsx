import { readDB } from "@/lib/db";
import { origin } from "@/lib/notify";
import { EMPTY_PAYMENTS } from "@/lib/payments";
import { PaymentsSettings } from "@/components/admin/PaymentsSettings";

export const metadata = { title: "Payments" };

export default async function PaymentsAdmin() {
  const { settings } = await readDB();
  const p = settings.payments ?? EMPTY_PAYMENTS;
  return <PaymentsSettings initial={p} siteUrl={await origin()} hooks={{ tabby: !!p.tabby.webhookSecret, ziina: !!p.ziina.webhookSecret }} />;
}
