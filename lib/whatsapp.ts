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
