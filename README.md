# Fynnest Lady Skincare

> *"You're the Fynnest... Be it."*

**Fynnest Lady** is a premium, modern skincare brand and high-performance e-commerce storefront dedicated to delivering gentle, efficacious, science-backed, and nature-inspired skincare. Engineered for radiance, skin barrier health, and inclusivity, Fynnest Lady pairs botanical extracts with dermatologist-trusted actives to nurture healthy, luminous skin.

The storefront is localized for Ghanaian commerce, featuring server-authoritative Ghanaian Cedi (`GHS`) pricing, responsive mobile-first commerce journeys, secure authentication, and an autonomous engineering governance engine.

---

## 🌟 What the Store is About

Fynnest Lady provides an intuitive, accessible skincare discovery and shopping experience designed around real customer skin concerns:

- **Skin Concern Discovery:** Guided curation targeting Hyperpigmentation & Dark Spots, Deep Hydration, Acne & Blemish Care, and Barrier Restoration.
- **Full Skincare Rituals:** Comprehensive daily regimens ranging from morning sun protection to evening restorative recovery.
- **Verified Product Catalogue:**
  1. **Gentle Hydrating Cleanser (GHS 120.00):** pH-balanced, non-stripping daily facial cleanser infused with green tea, chamomile, and aloe vera.
  2. **Clarifying Exfoliating Toner (GHS 140.00):** Gentle AHA/BHA clarifying solution with willow bark and tea tree to refine pores and texture.
  3. **Radiance Boosting Vitamin C Serum (GHS 250.00):** High-potency antioxidant serum formulated to fade dark spots, even tone, and stimulate collagen.
  4. **Deep Moisture Recovery Cream (GHS 220.00):** Rich, soothing moisturizer powered by ceramides, squalane, and shea butter for 24-hour barrier defense.
  5. **Daily Defense Sunscreen SPF 50+ (GHS 180.00):** Broad-spectrum UVA/UVB PA++++ physical/chemical hybrid sunscreen with zero white cast and a weightless finish.
  6. **Nourishing Botanical Body Oil (GHS 195.00):** Fast-absorbing, luxurious blend of rosehip, jojoba, and baobab oils for silky, hydrated body care.
- **Accessible & Transparent:** 44px minimum touch targets, visible focus indicators, persistent cart drawer, detailed ingredient listings, and verified customer guidance without exaggerated or unsubstantiated claims.

---

## 🛠️ Tools & Technology Stack

The platform is engineered using modern, production-grade cloud, web, and database technologies:

### Frontend & UI Architecture
- **[Next.js 15](https://nextjs.org/) (App Router & Turbopack):** Server-side rendering (SSR), streaming components, React Server Components (RSC), and sub-second local compilation.
- **[React 19](https://react.dev/):** Component-driven interface utilizing modern hooks, Suspense, client/server boundaries, and accessibility standards.
- **[TypeScript](https://www.typescriptlang.org/):** Strict, end-to-end type safety across domain entities, catalogue items, props, and API payloads.
- **[Tailwind CSS v4](https://tailwindcss.com/):** Modern styling with design tokens derived from the Fynnest Lady brand logo (deep berry primary `#7c184a`, warm gold accent `#8a651c`, and sophisticated warm neutrals).
- **[Lucide React](https://lucide.dev/):** Lightweight, accessible icon system.

### Authentication & Security
- **[Clerk](https://clerk.com/):** Sole authentication provider ([ADR-006](docs/architecture/ADR/ADR-006-authentication.md)), powering secure customer sign-in, sign-up, user profiles, and session validation.
- **Client/Server Isolation:** Zero server secrets in client bundles (`CLERK_SECRET_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are isolated strictly to server-only operations).
- **Security Hardening:** Enforced Content Security Policies, protected middleware routes, and automated credential leakage scanners.

### Database & Backend
- **[Supabase](https://supabase.com/) (PostgreSQL 15):** Relational database managing product catalogues, categories, customers, orders, inventory, and order items.
- **Row Level Security (RLS):** Granular PostgreSQL RLS policies enforcing public read grants for active inventory and strictly isolating customer data.
- **Database Migrations:** Deterministic, version-controlled SQL migrations located under `supabase/migrations/` and verifiable in disposable PostgreSQL test containers.

### Quality Assurance & Testing
- **Node.js Test Runner (`node --test`):** Automated deterministic test suite verifying public configuration, platform safety, quality gates, and architecture policies.
- **[Playwright](https://playwright.dev/):** End-to-end browser verification validating navigation and keyboard accessibility across 7 representative device widths (320px, 375px, 390px, 430px, 768px, 1024px, 1440px).
- **ESLint & Prettier:** Automated code hygiene, formatting, and linting.

### Governance, CI/CD & Deployment
- **[GitHub Actions](https://github.com/features/actions):** Automated pipelines running CodeQL security analysis, dependency vulnerability reviews, accessibility audits, secret scanning, and evidence gates.
- **Fynnestlady Engineering Bot:** Autonomous control-plane backed by a dedicated GitHub App and Gemini CLI integration for PR inspection, multi-agent review verification (Architecture, Product, Database, Security, Design, Testing), and safe merges.
- **[Vercel](https://vercel.com/):** Production deployment infrastructure with post-deployment smoke tests and rollback automation.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js:** v22.14.0 or later (specified in `.nvmrc`)
- **npm:** v10.9.0 or later

### Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/appiah233/fynnestlady.git
   cd fynnestlady
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the example environment configuration:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your public development keys:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the storefront.

5. **Run Tests & Validation:**
   ```bash
   # Run unit, security, and architecture tests
   npm test

   # Run foundation artifact validation
   node scripts/validate-foundation.mjs

   # Run TypeScript typechecking
   npm run typecheck

   # Run linting
   npm run lint
   ```

---

## 🏛️ Project Governance

- Development occurs on the `dev` branch.
- Feature changes are developed in dedicated branches tied to tracked issues.
- Releases to `main` occur exclusively through governed pull requests after all automated security, accessibility, database, and specialist role evidence gates have completed.
- For complete governance and architectural standards, see [RULES.md](RULES.md) and [docs/governance/PROJECT_GOVERNANCE.md](docs/governance/PROJECT_GOVERNANCE.md).

---

## 👤 Project Owner

**Eric Appiah Owusu** is the project owner and exclusive merge authority for the Fynnest Lady platform.
