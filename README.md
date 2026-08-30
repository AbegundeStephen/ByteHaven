# ByteHaven

Single-vendor e-commerce platform for laptops and laptop accessories. See
`ByteHaven_SRS_UserJourney.docx` for full requirements and
`ByteHaven_Claude_Build_Prompts.md` for the phased build plan.

## Getting started

```bash
npm install
cp .env.example .env   # fill in real values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database (Prisma + Supabase)

Schema lives in `prisma/schema.prisma`. `lib/db.ts` constructs `PrismaClient`
with the `@prisma/adapter-pg` driver adapter (required by Prisma 7) against
the pooled `DATABASE_URL`.

### Applying schema changes

**On a normal network, the standard Prisma workflow works as usual:**
`npx prisma migrate dev`.

**On this project's current setup, `prisma migrate`/`db push`/`migrate resolve`
cannot run** — Supabase's true direct connection
(`db.<ref>.supabase.co:5432`) resolves IPv6-only, and this dev environment has
no IPv6 route; meanwhile Prisma's schema engine always uses named prepared
statements, which collide across pooled connections when run through the
transaction pooler (port 6543), failing with
`ERROR: prepared statement "s1" already exists`. If you hit that error, your
network can't reach the direct connection either — check with
`Test-NetConnection <host> -Port 5432`, or ask Supabase support about the
project's session-pooler/IPv4 add-on options.

Until that's resolved, apply schema changes with the two helper scripts
(these use plain `pg` over the transaction pooler, which doesn't hit the
prepared-statement issue since regular queries use unnamed statements):

```bash
# 1. Generate the SQL diff locally — no DB connection needed.
npx prisma migrate diff --from-migrations prisma/migrations --to-schema-datasource prisma/schema.prisma --script > prisma/migrations/<timestamp>_<name>/migration.sql
# (for the very first migration, use --from-empty instead of --from-migrations)

# 2. Apply it directly against the pooled connection.
DATABASE_URL_RAW="$DATABASE_URL" node scripts/apply-migration.js prisma/migrations/<timestamp>_<name>/migration.sql

# 3. Record it in Prisma's migration history so future diffs are relative to it.
DATABASE_URL_RAW="$DATABASE_URL" node scripts/record-migration.js prisma/migrations/<timestamp>_<name>

# 4. Regenerate the client.
npx prisma generate
```

### Seeding

```bash
npm run db:seed
```

## Payments (Paystack)

`lib/paystack.ts` wraps Paystack's Initialize/Verify Transaction REST API and
webhook signature verification. The flow: `/checkout` creates a pending order
→ `/checkout/pay/[orderNumber]` calls `POST /api/checkout/[orderNumber]/initialize`
(server-side, amount pulled from the DB — never trusted from the client) →
the Paystack Inline JS popup resumes that transaction via its access code →
on success, `/order-confirmation/[orderNumber]` and the `/api/webhooks/paystack`
handler both call `confirmOrderPayment()`, which always re-verifies with
Paystack server-side before marking an order paid (never trusts the popup's
own "success" callback, per FR-C2/C3). Each payment attempt gets a fresh
Paystack reference (`<orderNumber>-<timestamp>`), so an abandoned/failed
attempt can be retried against the _same_ order without creating a duplicate.

### Switching from test to live keys at launch

1. In the Paystack dashboard, flip to **Live Mode** and copy the live
   `sk_live_...` / `pk_live_...` keys from Settings → API Keys & Webhooks.
2. Set `PAYSTACK_SECRET_KEY` / `PAYSTACK_PUBLIC_KEY` to the live values in
   your hosting provider's environment variables (never commit them).
3. In the live-mode dashboard, add a webhook pointing at
   `https://<your-domain>/api/webhooks/paystack` (Settings → API Keys &
   Webhooks → Webhook URL). The signing secret is your live secret key — no
   separate webhook secret to configure.
4. Confirm the account has completed Paystack's business verification —
   live-mode transactions are blocked until that's done.
5. Test-mode transactions and their orders are entirely separate from live
   ones; no data migration is needed when switching.

## Transactional email (Resend)

`lib/email.ts` sends two emails whenever `confirmOrderPayment()` marks an
order paid (best-effort — a failed email never undoes a confirmed payment,
see `lib/paystack.ts`): an order confirmation to the buyer and a new-paid-
order alert to `ADMIN_EMAIL`.

**Resend's sandbox mode** (no verified domain) only allows sending _to_ the
email address the Resend account was signed up with — sending to any other
address (including a placeholder `ADMIN_EMAIL` or a real buyer's email)
returns a 403. That's expected in dev; before launch, verify a real domain
at resend.com/domains, switch `EMAIL_FROM_ADDRESS` to use it, and set
`ADMIN_EMAIL` to Akintayo's real inbox.

## WhatsApp

`lib/whatsapp.ts` builds `wa.me` click-to-chat links — free, no API keys,
no approval process. Three entry points: a site-wide floating button
(`components/storefront/whatsapp-float-button.tsx`), a per-product "Chat on
WhatsApp" button pre-filled with the product name and link, and a
"Confirm on WhatsApp" button on the paid order-confirmation page pre-filled
with the order number. All of it reads `WHATSAPP_BUSINESS_NUMBER`; every
button renders nothing (not a broken link) if that env var is unset.

### Future: WhatsApp Business Cloud API (Meta) — post-launch, not built

This MVP deliberately stops at click-to-chat links. A later phase could add
Meta's WhatsApp Business Cloud API for _automated_ messages — e.g. pinging
Akintayo the moment an order is paid, or auto-notifying a buyer when their
order ships — without either party needing to open a chat first. That
requires: a Meta Business/WhatsApp Business Platform account and business
verification, a permanent access token and phone number ID from Meta,
pre-approved message templates (Meta rejects free-form outbound messages
outside a 24-hour customer-service window), and a webhook endpoint (similar
in shape to `/api/webhooks/paystack`) to receive delivery/read receipts and
inbound replies. None of that exists yet — the current `lib/whatsapp.ts`
link-builder approach would stay as a fallback either way, since it needs no
approval and never breaks.

## Environment variables

See `.env.example` for the full list, with notes on where each one is used.
