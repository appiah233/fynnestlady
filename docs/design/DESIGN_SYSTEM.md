# Fynnestlady design system, sprint 1

This design follows the [building memo](../governance/BUILDING_MEMO.md): understand the customer, build for humans first, and verify mobile access and clarity before expanding features. The initial system makes discovery and commerce actions understandable without invented product content.

## Brand source and logo use

The supplied `logo.jpeg` shows a gold profile and leaf form, a vivid berry flower, and a script wordmark on a near-white ground. `public/brand/fynnestlady-logo.jpeg` is an unchanged copy of that source. The baked-in line “You're the Fynnest...Be it.” is part of the image; do not silently replace it with the separately approved brand statements. The source has generous whitespace and fine detail, so display it with its full square aspect ratio and meaningful alt text, at least 120 CSS pixels wide. Do not crop the wordmark or use the JPEG as a tiny icon. A clean vector and a compact official mark require owner-provided assets or approval. The visual system uses restrained berry and warm gold accents drawn from the logo, with warm neutral surfaces so the brand does not become an all-pink interface.

## Tokens and foundations

`src/app/globals.css` defines semantic color tokens and exposes them to Tailwind v4. Background `#fcfaf7`, foreground `#29221e`, surface `#fffefa`, muted surface `#f5efe8`, berry primary `#7c184a`, gold accent `#8a651c`, and blue focus `#1d5f8a` are preliminary translation values, subject to visual review against the official logo and real product photography. Gold is used for small emphasis; body text uses dark foreground. Never convey status through color alone.

The body stack is Arial/Helvetica and display stack Georgia/Times New Roman until licensed brand fonts are approved. Body copy starts at 16px with 1.55 line height; display headings use restrained letter spacing and 1.12 line height. Maintain one `h1` per page and a logical heading order. Spacing uses a 4px base rhythm; common gaps are 8, 12, 16, 24, 32, 48, and 64px. `--gutter` is fluid from 16 to 48px; `.container-page` caps content at 1280px. Small, medium, and large radii are 4, 8, and roughly 14px. Avoid card shadows as a default; borders and whitespace establish hierarchy.

## Layout and responsive behavior

Build mobile first. At 320–430px use one content column, generous 44px touch targets, and no horizontal scroll. At 768px, use two product columns and allow persistent navigation only if labels fit. At 1024px and 1440px, use three or four product columns depending on product-image quality and text length. Cap reading width around 70 characters for editorial copy. Preserve product price, availability, and primary action near each product's identity. Validate widths 320, 375, 390, 430, 768, 1024, and 1440px plus 200% zoom and keyboard navigation.

## Components and interaction contracts

| Pattern | Required behavior |
| --- | --- |
| Button | Primary for a single main action per region, secondary for alternatives, quiet for low-emphasis actions. Loading disables repeated activation and announces busy state. |
| Link | Underline in body copy; visible focus. Navigation can use a distinct active indicator and `aria-current="page"`. |
| Form | Persistent label, optional hint, text error associated with its input, 44px minimum target. Error recovery preserves entered values. |
| Product card | Real product image with verified alt, product name, purpose/category only when verified, GHS price from server contract, availability, and a clear destination. No fabricated claims or ratings. |
| Content card | One linked destination, concise heading and summary, no nested competing links. |
| Badge | Short status text; no meaning conveyed by hue alone. |
| Navigation | Mobile menu button names its action and exposes expanded state. Drawer traps focus while open, closes with Escape, restores focus, and prevents background interaction. Desktop nav exposes the same destinations. |
| Dialog | Named by a visible heading, focus moves inside and returns to trigger, Escape closes unless a destructive confirmation needs a deliberate decision. |
| Empty state | Explain what is absent and offer one useful next action. |
| Loading state | Reserve layout space; use an accessible text status alongside skeletons where loading duration is material. Respect reduced motion. |
| Error/success | Describe the state in text, provide recovery where possible, and use appropriate live-region behavior without repeated announcements. |

The first executable primitives are `Button`, `TextField`, `Badge`, `Alert`, and `EmptyState`; CSS also supplies card and skeleton styles. StorefrontAgent should use these as the base and implement navigation, cards, drawers, and dialogs with an accessible shadcn/ui primitive where interactive focus management is needed. Component APIs must be reviewed against actual product and catalogue contracts before customer-facing pages use them.

## Design review gate

DesignAgent critiques hierarchy, logo treatment, content accuracy, crop, contrast, focus, touch targets, reflow, forms, loading/error states, and conversion friction. TestingAgent independently verifies representative widths and keyboard behavior. Production imagery, catalogue claims, and legal checkout copy remain pending verified source material.
