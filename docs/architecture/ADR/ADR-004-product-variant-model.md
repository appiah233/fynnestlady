# ADR-004: Product and Variant Model

Status: **Proposed**

## Context
Products need rich content and may have genuine purchasable sizes or forms.
## Problem
Represent merchandising identity separately from SKU, price, and stock.
## Options
Product-only; product plus genuine variants; forced variants for every display choice.
## Decision
Use Product for shared identity and ProductVariant for every purchasable SKU; a non-variable product has one default purchasable variant.
## Consequences
Consistent cart/inventory references without fabricated variation.
## Risks
Admin UX may expose implementation detail for single-variant products.
## Alternatives
Product-only fails genuine variation; forced presentation variants misrepresent catalogue truth.
## Revisit conditions
Bundles, subscriptions, or configurable products receive owner approval.
