# Next eligible product work

This backlog follows the [building memo](../governance/BUILDING_MEMO.md): customer understanding, clear commerce information, accessibility, security, and verified content come before publication. It refines the [product vision](PRODUCT_VISION.md), [customer journeys](USER_JOURNEYS.md), and owner-approved Supabase/Vercel architecture. Issue numbers and branches are assigned by Fynnestlady Engineering Bot after dependencies pass; proposed work is not evidence of implementation.

## Sequencing

Authentication, catalogue read contracts, and reviewed storefront shell can begin after their Sprint 1 dependencies pass. Cart depends on authoritative variant/availability reads. Account depends on authentication and order ownership contracts. Checkout depends additionally on owner-approved delivery, tax, refund, and privacy rules; payment depends on the settled order/payment contract. Keep these workstreams separate and let TestingAgent verify them independently.

## Authentication — SecurityAgent

Outcome: a customer can create and recover an account and maintain a secure session through Clerk.

Acceptance:

- Anonymous access to customer or admin data is denied server-side and by RLS.
- Sign-up, login, logout, recovery, expiration, and session refresh have positive and negative tests; recovery gives a generic response for unknown accounts.
- Customer A cannot read or change Customer B's profile, cart, address, or order.
- Editing user metadata cannot grant admin access. Admin membership is checked through a reviewed server-side contract, with no service-role key in the browser.
- Forms retain input on recoverable errors, offer visible labels and status, work with keyboard, and meet the seven responsive widths in the Sprint 1 acceptance contract.

Dependency: proven database/RLS gate and SecurityAgent review of the private admin membership lookup. Product decision still needed for guest checkout mode and which profile fields are collected.

## Verified catalogue — CommerceAgent and DatabaseAgent

Outcome: customers can discover purchasable variants with accurate price and availability, with no invented product facts.

Acceptance:

- A product and its genuine purchasable variants have separate stable identities; SKU is unique; GHS prices use integer pesewas.
- Public reads return active, reviewed products and variants only. Draft, archived, or unverified content stays hidden.
- Price, stock, and publication status come from server/database records; browser submissions cannot alter them.
- Category, collection, concern, and search/filter contracts have bounded pagination and deterministic ordering. Concern links describe discovery, never diagnosis or cure.
- Empty catalogue is a supported state and shows a useful non-fabricated message.
- TestingAgent checks unpublished leakage, invalid prices, duplicate SKUs, and stock/availability disagreement.

Dependency: migration/RLS verification and explicit ProductAgent taxonomy contract. Publication and real product cards require owner-supplied, human-verified catalogue records, images, ingredients, warnings, claims, and prices.

## Storefront discovery — StorefrontAgent

Outcome: customers understand the brand and can reach verified products or guidance without friction.

Acceptance:

- One clear main landmark, working skip link, semantic navigation, mobile menu, meaningful image alternatives, and no dead destinations.
- Home, Shop, concern discovery, product detail, About, and guidance use DesignAgent specifications and documented CommerceAgent read models.
- Empty and loading states remain honest when catalogue content is unavailable; no invented recommendations, ratings, stock, delivery promises, or efficacy claims appear.
- Search/filter state is shareable and announces result changes; keyboard and touch interactions work at 320, 375, 390, 430, 768, 1024, and 1440 CSS pixels, plus 200% zoom.
- DesignAgent critiques the implemented hierarchy and logo use; TestingAgent checks responsive and accessibility behavior on the exact candidate commit.

Dependency: design system acceptance and CommerceAgent catalogue read model. Verified imagery, product text, concern taxonomy, and approved guidance are required before populated discovery pages.

## Cart — CommerceAgent

Outcome: the customer can express purchase intent and review a reliable server-calculated estimate.

Acceptance:

- Adding a valid variant with quantity two shows quantity two; repeated adds have a defined aggregation rule.
- Invalid, inactive, or out-of-stock variants cannot silently enter checkout; the cart explains changes and preserves recoverable intent.
- Browser-supplied prices, discounts, totals, and stock assertions are ignored. Server recalculates GHS totals from current authoritative records and states when an estimate changed.
- Quantity limits, zero/remove behavior, persistence mode, and signed-in merge rules are specified before implementation.
- Customer A cannot access Customer B's persisted cart; TestingAgent verifies positive and negative flows.

Dependency: verified variant read contract, stock policy, and authentication for persisted customer carts. Owner must choose guest-cart/guest-checkout policy before that branch is implemented.

## Customer account — StorefrontAgent with SecurityAgent and CommerceAgent

Outcome: a signed-in customer can view and manage only their own account information and order history.

Acceptance:

- Profile and address changes require a current authenticated session and server authorization; cross-customer read/write attempts fail.
- Order history and detail show immutable purchase-time snapshots and verified status, with clear empty and failure states.
- Password and session actions use Clerk contracts; sensitive changes do not expose tokens in UI or logs.
- Account navigation, forms, focus, error text, 200% reflow, and seven widths pass DesignAgent and TestingAgent review.

Dependency: authentication, address model, order read contract, and approved data-retention/privacy requirements. Order history can be built against test fixtures but cannot claim complete checkout behavior before payment verification.

## Owner-supplied inputs and release boundary

The owner or designated human reviewer must supply and approve real catalogue facts, prices, images, ingredient and safety details, concern taxonomy, and claims before product publication. Ghana delivery, tax, refund, terms, and privacy rules remain unresolved for checkout. No live Paystack transaction, production customer data, or production deployment is part of these work items.
