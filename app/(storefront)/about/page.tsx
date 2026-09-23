import type { Metadata } from "next";
import { WhatsAppCtaButton } from "@/components/storefront/whatsapp-cta-button";
import { buildStoreWhatsAppLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "About & Contact",
  description:
    "About AkinStore — a trusted online store for new, UK-used, and refurbished laptops and accessories.",
};

const VALUES = [
  {
    title: "Verified condition",
    body: "Every listing states its real condition — new, UK-used, or refurbished.",
  },
  {
    title: "Transparent pricing",
    body: "No hidden fees. What you see is what you pay.",
  },
  {
    title: "Real support",
    body: "Reach a real person on WhatsApp before or after you buy.",
  },
];

export default function AboutPage() {
  const whatsappLink = buildStoreWhatsAppLink(
    "Hi! I have a question about AkinStore.",
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-primary text-3xl font-bold sm:text-4xl">
        About AkinStore
      </h1>
      <p className="text-muted-foreground mt-4 text-sm leading-relaxed sm:text-base">
        AkinStore is an online store for laptops and laptop accessories, built
        around one simple idea: buying a used or refurbished device online
        shouldn&apos;t feel like a gamble. Every listing shows its real
        condition — new, UK-used, or refurbished — along with verified specs and
        transparent pricing, so you know exactly what you&apos;re getting before
        you pay.
      </p>
      <p className="text-muted-foreground mt-4 text-sm leading-relaxed sm:text-base">
        Payments are processed securely through Paystack, and you can always
        reach us directly on WhatsApp to ask questions before you buy, or to
        coordinate delivery after you do.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {VALUES.map((value) => (
          <div
            key={value.title}
            className="border-border bg-card rounded-xl border p-5 shadow-sm"
          >
            <p className="text-foreground text-sm font-semibold">
              {value.title}
            </p>
            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
              {value.body}
            </p>
          </div>
        ))}
      </div>

      <div className="border-border bg-card mt-8 rounded-xl border p-6 shadow-sm">
        <h2 className="text-foreground text-sm font-semibold">Get in touch</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Have a question about a product, an existing order, or delivery? Chat
          with us directly on WhatsApp.
        </p>
        {whatsappLink && (
          <div className="mt-4">
            <WhatsAppCtaButton link={whatsappLink} label="Chat on WhatsApp" />
          </div>
        )}
      </div>
    </div>
  );
}
