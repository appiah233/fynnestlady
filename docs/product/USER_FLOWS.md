# User Flows

## Critical Customer Flow

`Register → Login → Browse → Find product → Select variant → Add to bag → Cart → Checkout → Pay → Order confirmation → View order`

At cart and checkout, the server reloads product, price, discount eligibility, and stock. A pending order precedes payment initialization. Success requires verified provider state, not a browser redirect.

## Critical Admin Flow

`Admin login → Create draft product → Add verified details/media/concerns → Set price/inventory → Publish → Receive order → Process → Fulfil`

Every state-changing step is authorized, validated, and auditable. Publishing fails when required verified data is absent.

## Payment Flow

`Server total → Pending order → Paystack initialize → Customer payment → Signed webhook/callback → Independent verification → Payment transition → Order transition → Inventory finalization → Confirmation`

Retries reuse idempotency controls. Payment and order states change independently according to explicit transition rules.

## Password Reset

`Request → Generic response → Single-use expiring token → Password policy → Session invalidation → Confirmation`

Responses do not reveal whether an account exists; endpoints are rate-limited and audited without logging secrets.
