import { NextRequest, NextResponse } from "next/server";
import { confirmOrderPayment, verifyWebhookSignature } from "@/lib/paystack";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "charge.success" && event.data?.reference) {
    try {
      await confirmOrderPayment(event.data.reference);
    } catch (e) {
      console.error("Paystack webhook: failed to confirm payment", e);
    }
  }

  // Acknowledge receipt regardless of internal outcome (once the signature
  // is verified) so Paystack doesn't endlessly retry an event we can't act on.
  return NextResponse.json({ received: true });
}
