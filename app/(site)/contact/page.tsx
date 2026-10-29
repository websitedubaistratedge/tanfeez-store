import type { Metadata } from "next";
import { ContactView } from "@/components/pages/ContactView";

export const metadata: Metadata = {
  title: "Contact",
  description: "Visit the TANFEEZ workshop in Dubai Investment Park 2, call +971 4 835 8197 or message us on WhatsApp.",
};

export default function ContactPage() {
  return <ContactView />;
}
