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

## Environment variables

See `.env.example` for the full list, with notes on where each one is used.
