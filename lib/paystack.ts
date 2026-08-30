import { createHmac, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";
import {
  sendAdminOrderAlertEmail,
  sendOrderConfirmationEmail,
} from "@/lib/email";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

function getSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not configured");
  return key;
}

interface InitializeTransactionInput {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, unknown>;
}

interface InitializeTransactionResult {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

/** Initializes a Paystack transaction server-side — the amount and
 * reference always come from the database, never the client (FR-C2). */
export async function initializeTransaction(
  input: InitializeTransactionInput,
): Promise<InitializeTransactionResult> {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: input.amountKobo,
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
    }),
  });

  const json = await res.json();
  if (!res.ok || !json.status) {
    throw new Error(
      json.message ?? "Failed to initialize Paystack transaction",
    );
  }

  return {
    authorizationUrl: json.data.authorization_url,
    accessCode: json.data.access_code,
    reference: json.data.reference,
  };
}

export type PaystackVerifyStatus = "success" | "failed" | "abandoned" | string;

interface VerifyTransactionResult {
  status: PaystackVerifyStatus;
  reference: string;
  amountKobo: number;
}

/** Calls Paystack's Verify Transaction endpoint — the only source of truth
 * for whether a payment actually succeeded (FR-C3). Never trust a client
 * callback or webhook payload alone. */
export async function verifyTransaction(
  reference: string,
): Promise<VerifyTransactionResult> {
  const res = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${getSecretKey()}` } },
  );
  const json = await res.json();
  if (!res.ok || !json.status) {
    throw new Error(json.message ?? "Failed to verify Paystack transaction");
  }
  return {
    status: json.data.status,
    reference: json.data.reference,
    amountKobo: json.data.amount,
  };
}

/** Verifies the `x-paystack-signature` header against the raw request body.
 * Must be called with the raw (unparsed) body text. */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  if (!signature) return false;
  const expected = createHmac("sha512", getSecretKey())
    .update(rawBody)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "hex");
  const signatureBuf = Buffer.from(signature, "hex");
  if (expectedBuf.length !== signatureBuf.length) return false;
  return timingSafeEqual(expectedBuf, signatureBuf);
}

export type ConfirmPaymentOutcome =
  | "already_confirmed"
  | "confirmed"
  | "not_successful"
  | "order_not_found"
  | "amount_mismatch";

export interface ConfirmPaymentResult {
  outcome: ConfirmPaymentOutcome;
  orderNumber?: string;
}

/** Single source of truth for marking an order paid, used by both the
 * webhook handler and the confirmation page's fallback verify. Always
 * re-verifies with Paystack server-side before touching the database, and
 * is idempotent (safe to call more than once for the same reference). */
export async function confirmOrderPayment(
  reference: string,
): Promise<ConfirmPaymentResult> {
  const order = await db.order.findFirst({
    where: { paymentReference: reference },
    include: { items: true },
  });
  if (!order) return { outcome: "order_not_found" };
  if (order.paymentStatus === "success") {
    return { outcome: "already_confirmed", orderNumber: order.orderNumber };
  }

  const verified = await verifyTransaction(reference);

  const expectedAmountKobo = Math.round(Number(order.total) * 100);
  if (
    verified.status === "success" &&
    verified.amountKobo !== expectedAmountKobo
  ) {
    return { outcome: "amount_mismatch", orderNumber: order.orderNumber };
  }

  if (verified.status === "success") {
    await db.order.update({
      where: { id: order.id },
      data: { paymentStatus: "success", status: "paid" },
    });

    // Best-effort — a failed email must never undo a confirmed payment.
    const [confirmationResult, alertResult] = await Promise.allSettled([
      sendOrderConfirmationEmail(order),
      sendAdminOrderAlertEmail(order),
    ]);
    if (confirmationResult.status === "rejected") {
      console.error(
        `Order confirmation email failed for ${order.orderNumber}:`,
        confirmationResult.reason,
      );
    }
    if (alertResult.status === "rejected") {
      console.error(
        `Admin order alert email failed for ${order.orderNumber}:`,
        alertResult.reason,
      );
    }

    return { outcome: "confirmed", orderNumber: order.orderNumber };
  }

  await db.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: verified.status === "failed" ? "failed" : "pending",
    },
  });
  return { outcome: "not_successful", orderNumber: order.orderNumber };
}
