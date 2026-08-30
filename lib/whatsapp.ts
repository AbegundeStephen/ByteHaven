/** Normalizes a Nigerian phone number (0..., 234..., or +234...) to the
 * international digits-only format wa.me links require. */
export function toWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("234")) return digits;
  if (digits.startsWith("0")) return `234${digits.slice(1)}`;
  return digits;
}

/** Builds a wa.me click-to-chat URL with a pre-filled, URL-encoded message. */
export function buildWhatsAppLink(phone: string, message: string): string {
  const number = toWhatsAppNumber(phone);
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/** wa.me link to the store's own WhatsApp Business number, for site-wide
 * "Chat on WhatsApp" entry points (FR-H1). Returns null if unconfigured,
 * so callers can render nothing rather than a broken link. */
export function buildStoreWhatsAppLink(message: string): string | null {
  const businessNumber = process.env.WHATSAPP_BUSINESS_NUMBER;
  if (!businessNumber) return null;
  return buildWhatsAppLink(businessNumber, message);
}

/** Absolute site URL for building shareable links inside WhatsApp messages
 * (they're opened outside the app, so relative paths won't work). */
export function getSiteUrl(): string {
  return process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}
