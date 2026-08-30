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

## Environment variables

See `.env.example` for the full list, with notes on where each one is used.
