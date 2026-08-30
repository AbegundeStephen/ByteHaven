---
title: ByteHaven — Phase-by-Phase Build Prompts for Claude
prepared_for: Akintayo John
version: 1.0
date: 2026-08-30
companion_document: ByteHaven_SRS_UserJourney.docx
---

# ByteHaven — Phase-by-Phase Claude Execution Prompts

This document turns the ByteHaven SRS into a sequence of ready-to-paste prompts for **Claude Code** (or Claude in a coding-capable environment) to execute the build one phase at a time.

## How to use this document

1. Work through the phases **in order** — each one assumes the previous phases are done and working.
2. Start a phase by pasting its **Prompt** block into Claude as-is. Fill in any bracketed `[placeholders]` first (API keys, business details, etc.) — never paste real secret keys into a prompt; tell Claude to read them from environment variables instead.
3. After Claude finishes a phase, walk through that phase's **Acceptance Checklist** yourself (or ask Claude to demonstrate each item) before starting the next phase.
4. If something in a later phase needs to change an earlier decision, say so explicitly in the prompt — Claude will otherwise assume the existing code is settled.
5. Keep the SRS document (`ByteHaven_SRS_UserJourney.docx`) open alongside this one — several prompts reference its section numbers directly.

**Tech stack locked in by the SRS:** Next.js (App Router, TypeScript), Tailwind CSS + shadcn/ui, PostgreSQL via Prisma, NextAuth.js (Auth.js) for admin login, Paystack for payments, Vercel for hosting.

---

## Phase 0 — Project Setup & Architecture

**Goal:** Scaffold the repository, tooling, and folder structure everything else will build on.

**Prerequisites:** None. This is the first phase.

**Prompt:**

```
You are building "ByteHaven," a single-vendor e-commerce platform for laptops and
laptop accessories, for a client named Akintayo John. Full requirements are in the
attached SRS document (ByteHaven_SRS_UserJourney.docx) — read it first and follow it
as the source of truth for scope and requirements.

Set up the project foundation:

1. Scaffold a new Next.js 14+ project using the App Router and TypeScript.
2. Install and configure Tailwind CSS, and set up shadcn/ui as the component library.
3. Install Prisma and configure it to target PostgreSQL (leave the actual DATABASE_URL
   as an environment variable placeholder — do not hardcode credentials).
4. Set up a clean project structure, e.g.:
   - app/(storefront)/...      — public buyer-facing routes
   - app/admin/...             — admin panel routes
   - app/api/...               — API route handlers
   - components/ui/            — shadcn components
   - components/storefront/    — buyer-facing components
   - components/admin/         — admin components
   - lib/                      — db client, auth config, paystack client, utils
   - prisma/schema.prisma
5. Add ESLint + Prettier with sensible defaults, and a .env.example listing every
   environment variable the project will need (DATABASE_URL, NEXTAUTH_SECRET,
   PAYSTACK_SECRET_KEY, PAYSTACK_PUBLIC_KEY, WHATSAPP_BUSINESS_NUMBER, email
   provider key, image storage credentials) — with placeholder values only.
6. Define a base color/typography design system in Tailwind config using a navy +
   teal + warm-gold palette suitable for a trustworthy tech retail brand, and confirm
   it against WCAG AA contrast.
7. Add a root layout with a placeholder header/footer and confirm the dev server
   runs cleanly with `npm run dev`.
8. Initialize git and commit this as the initial scaffold.

Do not build any features yet — this phase is purely setup. Summarize the folder
structure and the environment variables I'll need to provide once you're done.
```

**Acceptance checklist:**

- [ ] `npm run dev` starts with no errors
- [ ] Tailwind + shadcn/ui render a sample component correctly
- [ ] `prisma/schema.prisma` exists and `npx prisma validate` passes
- [ ] `.env.example` lists every variable referenced anywhere in the code
- [ ] Folder structure matches the plan above (or a clearly explained variant)

---

## Phase 1 — Database Schema & Core Backend

**Goal:** Implement the full data model from SRS Section 7 and basic data-access functions.

**Prerequisites:** Phase 0 complete; a real PostgreSQL database available (e.g. via Supabase, Neon, or Railway) with `DATABASE_URL` set locally.

**Prompt:**

```
Using the data model in Section 7 of the ByteHaven SRS, implement the full Prisma
schema with these models: AdminUser, Category, Product, ProductImage, Order, and
OrderItem — including the exact fields, types, and enums described there (condition:
new/uk_used/refurbished; product status: active/draft/sold_out; order status:
pending/paid/processing/shipped/delivered/cancelled; payment_status:
pending/success/failed).

1. Write the complete prisma/schema.prisma with proper relations, indexes on
   frequently-filtered fields (category_id, status, slug, order_number), and
   sensible defaults (uuid ids, created_at/updated_at).
2. Generate and run the initial migration.
3. Create a seed script (prisma/seed.ts) that populates 3–4 categories and ~10
   sample products with realistic laptop data (varied brands, prices, conditions,
   specs, and placeholder image URLs) so the storefront has content to develop
   against.
4. In lib/, create typed data-access functions for: listing/filtering/sorting
   products, fetching a product by slug, listing categories, creating an order with
   its order items in a single transaction, and fetching an order by order_number +
   phone/email (for the tracking feature in FR-D3).
5. Write these functions to be reusable by both the API routes we'll build in later
   phases and any server components that fetch data directly.

Run the migration and seed script, and confirm the seeded data is queryable.
```

**Acceptance checklist:**

- [ ] `npx prisma migrate dev` runs clean
- [ ] Seed script populates categories and products without errors
- [ ] A quick script/query can fetch filtered products and a single order
- [ ] Schema matches SRS Section 7 field-for-field (spot check 2–3 tables)

---

## Phase 2 — Admin Authentication

**Goal:** Secure login for the admin panel (SRS Section 4.5, FR-E1–E3).

**Prerequisites:** Phases 0–1 complete.

**Prompt:**

```
Implement secure admin authentication per SRS Section 4.5 (FR-E1, FR-E2, FR-E3).

1. Configure NextAuth.js (Auth.js) with a Credentials provider backed by the
   AdminUser table. Passwords must be hashed with bcrypt (or argon2) — never stored
   or compared in plain text.
2. Create a one-time setup script or seed step to create the first admin account
   from environment variables (ADMIN_EMAIL, ADMIN_PASSWORD) rather than a public
   sign-up form — there is no public admin registration in this product.
3. Build /admin/login with a clean, minimal form (email + password), inline
   validation, and clear error states for wrong credentials.
4. Protect every route under /admin/** (and every /api/admin/** route) with
   middleware that redirects unauthenticated requests to /admin/login.
5. Set session expiry per FR-E3 (e.g. sessions expire after a reasonable period of
   inactivity — use NextAuth's session maxAge) and enforce a minimum password
   strength when the admin account is created/reset.
6. Add a logout action accessible from the admin layout.

Confirm that visiting any /admin route while logged out redirects to login, and that
a correct login grants access and persists across a page refresh.
```

**Acceptance checklist:**

- [ ] Logging in with correct credentials grants access; wrong credentials are rejected with a clear message
- [ ] All `/admin/*` and `/api/admin/*` routes are unreachable without a session
- [ ] Passwords are hashed in the database, never plaintext
- [ ] Session persists on refresh and expires after inactivity
- [ ] Logout clears the session

---

## Phase 3 — Admin Product & Category CRUD

**Goal:** Full CRUD management for products (with images) and categories (SRS 4.6, FR-F1–F7).

**Prerequisites:** Phases 0–2 complete.

**Prompt:**

```
Build the admin catalog management screens per SRS Section 4.6 (FR-F1 through FR-F7).
This is the core of the admin experience, so prioritize a fast, modern, low-friction
UI using shadcn/ui components.

1. /admin/products — a searchable, filterable, sortable table of all products
   showing thumbnail, name, category, price, stock, and status, with a visible
   low-stock indicator (FR-F7) and quick actions (edit, toggle status, delete).
2. /admin/products/new and /admin/products/[id]/edit — a single reusable form
   component covering: name, brand, category (select), condition, price, optional
   discount price, stock quantity, specs (processor, RAM, storage, screen size,
   GPU, OS — as structured fields, not free text), description (rich text or
   markdown is fine), and status (active/draft/sold_out).
3. Multi-image upload with drag-and-drop, image reordering, deletion, and a way to
   mark one image as primary/cover (FR-F2). Store images via [your chosen storage
   provider — Supabase Storage/Cloudinary/S3] behind a small storage abstraction in
   lib/storage.ts so the provider can be swapped later without touching the UI.
4. Soft-delete (archive) rather than hard-delete for products that have existing
   orders attached, so historical orders are never broken; hard-delete is fine for
   products with no orders.
5. /admin/categories — create, rename, reorder (drag-and-drop or up/down controls),
   and delete categories, with a guard against deleting a category that still has
   products (prompt to reassign or block deletion).
6. All mutations go through /api/admin/** route handlers, validated server-side
   (use zod or similar) — never trust client-side validation alone.
7. Show optimistic UI updates or clear loading/success/error states on every action.

Demonstrate the full loop: create a product with 2+ images, edit it, mark it sold
out, and delete a category that has no products.
```

**Acceptance checklist:**

- [ ] A new product with multiple images can be created and appears correctly on the list
- [ ] Editing every field works and persists
- [ ] Primary image selection and reordering work
- [ ] Status toggle (active/draft/sold_out) reflects immediately
- [ ] Category CRUD works, including the "can't delete a category with products" guard
- [ ] All admin mutations are server-validated, not just client-validated

---

## Phase 4 — Storefront: Home, Catalog, Product Detail

**Goal:** The public buyer-facing browsing experience (SRS 4.1, FR-A1–A7).

**Prerequisites:** Phases 0–3 complete (there must be real product data to browse).

**Prompt:**

```
Build the public storefront browsing experience per SRS Section 4.1 (FR-A1–A7) and
the page inventory in Section 8.2. This is buyer-facing, so polish and mobile
responsiveness matter more here than anywhere else in the app.

1. Home page (/): hero/banner area, category shortcuts, and a featured/new-arrivals
   product grid, pulling real data (no more placeholder content).
2. Shop page (/shop): full catalog in a responsive grid (2 columns mobile, 3
   tablet, 4 desktop per SRS 8.3) with:
   - Filters: category, brand, price range, RAM, storage, screen size, condition
   - Sort: price low-high, price high-low, newest, popularity
   - Keyword search across name/brand/description
   - Pagination or infinite scroll — your choice, but must perform well with 200+
     products
3. Category pages (/shop/[category]) reusing the same grid/filter components,
   pre-filtered.
4. Product detail page (/product/[slug]): image gallery with swipe/zoom, name,
   price (and discount price with a strike-through original price if applicable),
   condition badge (New/UK-Used/Refurbished), full specs table, description, stock
   status, a related/similar-products section, and an "Add to Cart" call to action.
   (The WhatsApp button on this page is built in Phase 8 — leave a placeholder slot
   for it now.)
5. Every product-grid item and the product detail page must show the condition
   badge clearly — this is a key trust signal per the SRS design principles.
6. Use Next.js data fetching (server components / generateStaticParams where
   sensible) so these pages are fast and SEO-friendly, per NFR "Performance" and
   "SEO" in SRS Section 5.
7. Handle empty states gracefully (no results for a filter combination, sold-out
   product still viewable but clearly marked unavailable to purchase).

Confirm filtering, sorting, and search all work together correctly (e.g. searching
within a filtered category), and that the layout is clean at mobile, tablet, and
desktop widths.
```

**Acceptance checklist:**

- [ ] Home, shop, category, and product-detail pages all render real seeded data
- [ ] Filters, sort, and search compose correctly together
- [ ] Condition badges appear everywhere a product is shown
- [ ] Layout is correct at the three breakpoints in SRS 8.3 (resize/DevTools test)
- [ ] Sold-out products are visible but clearly not purchasable
- [ ] Lighthouse mobile performance is in a reasonable range (aim ≥ 85 per NFR)

---

## Phase 5 — Cart & Checkout (Pre-Payment)

**Goal:** Cart management and the checkout form, stopping just short of payment (SRS 4.2, FR-B1–B5).

**Prerequisites:** Phases 0–4 complete.

**Prompt:**

```
Build the cart and pre-payment checkout flow per SRS Section 4.2 (FR-B1–B5).

1. A persistent cart (client-side state, e.g. Zustand or React context + localStorage,
   since there are no buyer accounts) that survives a page refresh within the same
   browser session.
2. A cart drawer (slide-out, accessible from a cart icon in the header showing item
   count) and a full /cart page — both showing line items with product image, name,
   unit price, quantity controls, remove action, and a running subtotal.
3. /checkout: a form capturing customer_name, customer_email, customer_phone, and
   either a delivery address or a "pickup in person" option (delivery_method), plus
   a read-only order summary (items, subtotal, total).
4. Server-side validation (zod) on submission: valid email format, valid Nigerian
   phone format, required fields present based on delivery_method.
5. On checkout submission, create an Order + OrderItem records in the database with
   status "pending" and payment_status "pending," generating a unique, human-
   readable order_number (e.g. "BH-10245"), per FR-B5 — but do NOT integrate actual
   payment yet; that is Phase 6. For now, after creating the pending order, redirect
   to a temporary placeholder "proceeding to payment..." screen so the flow is
   testable end-to-end.
6. Snapshot each product's current name and price onto the OrderItem at creation
   time (product_name_snapshot, unit_price_snapshot) so later catalog changes never
   alter historical orders.

Confirm you can add multiple items to cart, adjust quantities, remove an item, and
submit checkout to create a real pending Order in the database with correct
line-item snapshots.
```

**Acceptance checklist:**

- [ ] Cart persists across a page refresh
- [ ] Quantity changes and item removal update the subtotal correctly
- [ ] Checkout form validates required fields and formats before submitting
- [ ] Submitting checkout creates a pending Order + OrderItems with correct snapshots
- [ ] Order number is unique and human-readable

---

## Phase 6 — Paystack Payment Integration

**Goal:** Real, secure payment processing (SRS 4.3, FR-C1–C5). This is the highest-risk phase — follow it carefully.

**Prerequisites:** Phases 0–5 complete; a Paystack test account with test public/secret keys.

**Prompt:**

```
Integrate Paystack payments per SRS Section 4.3 (FR-C1–C5). Security here matters
more than anywhere else in the app — a buyer must never be able to mark their own
order "paid" without the payment actually being verified by Paystack on the server.

1. Store PAYSTACK_SECRET_KEY and PAYSTACK_PUBLIC_KEY as environment variables. The
   secret key must only ever be used in server-side code (API routes), never sent
   to the client or committed to the repo.
2. Build the payment flow as follows:
   a. When checkout is submitted (continuing from Phase 5's pending Order), call a
      server route that initializes a Paystack transaction (amount in kobo,
      customer email, and your generated order_number as the reference — or a
      metadata field linking to it), using Paystack's Initialize Transaction API.
   b. Use Paystack's Inline JS (v2) popup (@paystack/inline-js) on the client to
      open the payment modal with the authorization data from step (a) — or, if you
      prefer, redirect the buyer to the authorization_url from Standard Checkout.
      Either approach is acceptable; pick one and implement it fully.
   c. Regardless of which the client-side flow reports, treat it only as a hint.
      Implement a webhook route (e.g. /api/webhooks/paystack) that verifies the
      request signature using the secret key, and on a successful charge event,
      calls Paystack's Verify Transaction endpoint server-side before updating the
      matching Order's payment_status to "success" and status to "paid."
   d. Also implement a fallback verify step on the payment-return page (in case the
      webhook is delayed) that calls the same server-side verify function.
3. Handle failed/abandoned payments per FR-C4: if payment fails or the buyer
   abandons the popup/redirect, leave the order pending and let them retry from the
   same order rather than creating a duplicate order.
4. Store the Paystack transaction reference and final payment status on the Order
   record (FR-C5).
5. After the order is confirmed paid, redirect to the real order-confirmation page
   (replacing the Phase 5 placeholder) showing the order number, items, and total.
6. Write a short note in the code (or a README section) explaining how to switch
   from Paystack test keys to live keys for launch.

Test the full flow using Paystack's test card numbers end-to-end: pending order →
payment popup/redirect → webhook verification → order status flips to paid →
confirmation page. Also test a deliberately failed test payment to confirm the
order correctly stays "pending" rather than being marked paid.
```

**Acceptance checklist:**

- [ ] Secret key never appears in any client-side bundle or API response
- [ ] A successful test payment flips the order to paid only after server-side verification (not on client callback alone)
- [ ] Webhook signature is verified before trusting webhook payloads
- [ ] A failed/abandoned payment leaves the order retryable, not paid, and doesn't duplicate the order
- [ ] Payment reference and status are stored on the Order
- [ ] Confirmation page shows correct order details after a real successful payment

---

## Phase 7 — Order Management (Admin) & Order Confirmation/Tracking (Buyer)

**Goal:** Give the admin full visibility and control over orders, and let buyers check status (SRS 4.4 & 4.7, FR-D1–D3, FR-G1–G4).

**Prerequisites:** Phases 0–6 complete.

**Prompt:**

```
Build order management for the admin and order tracking for buyers, per SRS
Sections 4.4 and 4.7 (FR-D1–D3, FR-G1–G4).

Admin side:
1. /admin/orders — a list of all orders with filters by status and date range,
   showing order number, customer name, total, status, and payment status at a
   glance.
2. /admin/orders/[id] — full order detail: customer contact info, delivery method
   and address (if applicable), line items with product snapshots, payment info,
   and a status-update control that moves the order through pending → paid →
   processing → shipped/ready for pickup → delivered → cancelled (FR-G3). Only
   allow sensible transitions (e.g. don't let "pending" jump straight to
   "delivered").
3. A "Chat with buyer on WhatsApp" button on the order detail page that opens a
   wa.me link to the buyer's phone number, pre-filled with a message referencing
   the order number (FR-G4) — build this now even though the storefront-wide
   WhatsApp integration is Phase 8, since it only needs the buyer's phone number
   already on the order.

Buyer side:
4. Confirm the order-confirmation page (built in Phase 6) fully meets FR-D1: order
   number, items, total, and delivery details clearly shown.
5. /track-order — a simple lookup form (order number + phone or email) that shows
   the buyer their order's current status and summary (FR-D3), with a clear "not
   found" state for invalid lookups. Do not expose any other buyer's order data —
   validate that the phone/email actually matches the order_number before showing
   anything.
6. Send a transactional email on order confirmation (to the buyer) and on new paid
   order (to the admin), per FR-D2/FR-I1, using [your chosen email provider —
   Resend/SendGrid/Postmark]. Keep templates simple and readable on mobile email
   clients.

Demonstrate: an admin moving an order through several statuses, and a buyer
successfully tracking their own order while a lookup with mismatched details is
correctly rejected.
```

**Acceptance checklist:**

- [ ] Admin can filter/sort the orders list and view full order detail
- [ ] Status transitions are enforced in a sensible order, not arbitrary
- [ ] WhatsApp chat button opens with the correct pre-filled order reference
- [ ] Buyer order tracking works and correctly rejects a mismatched phone/email
- [ ] Confirmation and admin-alert emails send correctly on a real successful payment

---

## Phase 8 — WhatsApp Business Integration

**Goal:** Site-wide WhatsApp contact points (SRS 4.8, FR-H1–H3).

**Prerequisites:** Phases 0–7 complete; Akintayo's WhatsApp Business phone number.

**Prompt:**

```
Add WhatsApp Business integration per SRS Section 4.8 (FR-H1, FR-H2). This phase is
MVP-scoped to free click-to-chat links — do not attempt the WhatsApp Cloud API
integration here (that is explicitly a separate Phase 2/future enhancement, FR-H3).

1. Store the business WhatsApp number as an environment variable
   (WHATSAPP_BUSINESS_NUMBER, in international format e.g. 234XXXXXXXXXX).
2. Add a small reusable helper (lib/whatsapp.ts) that builds a wa.me link given a
   phone number and a message, properly URL-encoded.
3. Add a floating "Chat on WhatsApp" button visible site-wide on the storefront
   (e.g. bottom-right, with the standard WhatsApp icon/color), linking to a
   friendly generic greeting message.
4. On every product detail page, add/complete the "Chat on WhatsApp" button
   (placeholder left in Phase 4) with a message pre-filled with the product name
   and a link back to that product page, e.g. "Hi, I'm interested in the [Product
   Name] listed on ByteHaven ([link])."
5. On the order-confirmation page, add a "Confirm your order on WhatsApp" button
   pre-filled with the order number, per FR-H2, e.g. "Hi, I just placed order
   [BH-10245] on ByteHaven and wanted to confirm delivery details."
6. Make sure all WhatsApp buttons open in a new tab and degrade gracefully on
   desktop (where WhatsApp Web opens) and mobile (where the WhatsApp app opens).
7. Add a short section to the project README documenting how Phase 2 (WhatsApp
   Business Cloud API, FR-H3) could later be layered on for automated
   notifications, so the door is left open without building it now.

Confirm every WhatsApp entry point opens the correct chat with the correct
pre-filled message, on both desktop and a mobile viewport.
```

**Acceptance checklist:**

- [ ] Floating WhatsApp button appears on every storefront page
- [ ] Product-page WhatsApp button includes product name and link
- [ ] Order-confirmation WhatsApp button includes the order number
- [ ] Links work correctly on both desktop (WhatsApp Web) and mobile
- [ ] No Cloud API work was attempted in this phase (correctly deferred)

---

## Phase 9 — UI/UX Polish, Responsiveness, Accessibility & SEO

**Goal:** Bring the whole app up to the NFR bar in SRS Section 5 before launch.

**Prerequisites:** Phases 0–8 complete — this phase touches the whole app.

**Prompt:**

```
Do a full pass over the entire application against the non-functional requirements
in SRS Section 5 and the UI/UX principles in Section 8.1. Go screen by screen,
storefront and admin both.

1. Responsiveness: verify every page against the breakpoints in SRS 8.3 (mobile
   <640px, tablet 640–1024px, desktop >1024px). Fix any overflow, cramped touch
   targets (<44px), or broken layouts. Confirm the admin panel is at least usable
   on a tablet, even if optimized primarily for desktop.
2. Performance: audit image sizes and formats (use next/image everywhere images
   appear), add loading skeletons where data fetches are visible to the user,
   and check bundle size for anything unnecessarily large. Target Lighthouse
   mobile performance ≥ 85.
3. Accessibility: add meaningful alt text to all product images, verify color
   contrast against the design system meets WCAG AA, ensure every interactive
   element is reachable and operable by keyboard, and check that forms have
   properly associated labels. Target Lighthouse accessibility ≥ 90.
4. SEO: add descriptive <title> and meta description per page, Open Graph tags
   (including product image, name, and price) so shared WhatsApp/social links show
   a rich preview, a generated sitemap.xml, and basic Product structured data
   (JSON-LD) on product pages.
5. Consistency pass: confirm buttons, spacing, typography, and color usage are
   consistent across storefront and admin — fix any one-off styles that drifted
   from the design system set up in Phase 0.
6. Error handling: confirm every user-facing error (failed payment, invalid form,
   network error, 404) shows a clear, friendly message rather than a raw error or
   blank screen.

Report the before/after Lighthouse scores (mobile, performance/accessibility/SEO)
for the home page, a product page, and the checkout page.
```

**Acceptance checklist:**

- [ ] All pages verified at mobile/tablet/desktop breakpoints
- [ ] Lighthouse mobile performance ≥ 85 and accessibility ≥ 90 on key pages
- [ ] Every product image has alt text; color contrast passes WCAG AA
- [ ] Rich social/WhatsApp link previews confirmed (share a product link and check the preview)
- [ ] No raw/blank error states anywhere in the app

---

## Phase 10 — Testing, QA & Deployment

**Goal:** Ship it. Verify correctness end-to-end and deploy to production.

**Prerequisites:** Phases 0–9 complete.

**Prompt:**

```
Prepare ByteHaven for launch.

1. Write automated tests for the highest-risk logic: order total calculation, the
   Paystack webhook verification logic, checkout form validation, and the
   order-tracking lookup's authorization check (a buyer must not be able to view
   another buyer's order). Unit tests are sufficient for logic; a handful of
   integration/E2E tests (e.g. Playwright) covering "browse → add to cart →
   checkout → pay → confirmation" and "admin creates a product → it appears on the
   storefront" are strongly recommended given this is a payment flow.
2. Do a manual QA pass through every user journey step listed in SRS Section 3
   (both the Buyer Journey and the Admin Journey tables) and confirm each step
   works as described.
3. Security review: confirm no secrets are committed to git, all admin/API routes
   are properly authenticated/authorized, all user input is server-validated, and
   HTTPS is enforced in production.
4. Set up the production environment: a production PostgreSQL database, production
   Paystack live keys (kept out of the repo, set in the hosting provider's
   environment variable settings), production email-provider key, and the real
   WhatsApp Business number.
5. Deploy to Vercel (or the chosen host), run the production database migration,
   and re-run the seed/admin-creation step for the real production admin account
   (Akintayo's real login) — do not carry over any test data.
6. Confirm the production checkout flow end-to-end with a small real payment (or
   Paystack's live-mode test flow if available) before considering launch complete.
7. Write a short internal README covering: how to add a new admin user, how to
   rotate the Paystack keys, how to restore from a database backup, and how the
   Phase 2 WhatsApp Cloud API upgrade path works.

Report a final summary of what was tested, any known issues, and confirm the live
production URL is working.
```

**Acceptance checklist:**

- [ ] Automated tests pass, covering payment-adjacent logic and authorization checks
- [ ] Every step in both SRS Section 3 journey tables was manually walked through and works
- [ ] No secrets in git history; production uses live keys set via environment variables only
- [ ] Production deployment is live and a real checkout completes successfully
- [ ] Handoff README exists covering admin accounts, key rotation, backups, and the WhatsApp Cloud API upgrade path

---

## Notes on sequencing

- Phases 0–3 (setup → data → auth → admin CRUD) should be done before any storefront work, since the storefront needs real product data to be meaningful to build against.
- Phase 6 (payment) is deliberately isolated from Phase 5 (cart/checkout) so that the checkout _flow_ can be verified before the highest-risk payment logic is introduced.
- Phase 8 (WhatsApp) is intentionally scoped to free click-to-chat links only — the paid, verification-gated WhatsApp Business Cloud API (SRS FR-H3) is a Phase 2 / post-launch enhancement, not part of this build sequence.
- Phases 9–10 assume the whole app already functions; they are a hardening and shipping pass, not new features.
