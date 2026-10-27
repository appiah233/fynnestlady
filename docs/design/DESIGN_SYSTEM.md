# Fynnestlady design system

This system follows the [building memo](../governance/BUILDING_MEMO.md): start with customer understanding, clear commerce information, accessibility, and mobile use. The current UI primitives are foundation work; real catalogue content and checkout flows still require review.

## Brand and logo

The supplied JPEG contains a gold profile and leaf, berry flower, script wordmark, and the embedded line “You're the Fynnest...Be it.” Keep the full square image and its light background. Give it meaningful alternative text, display it at least 120 CSS pixels wide, and avoid cropping it into an icon. A compact logo needs an approved source asset. Neutral surfaces carry most of the interface; berry marks primary actions and gold is a restrained accent.

## Tokens and layout

`src/app/globals.css` owns semantic colors, typography, spacing, radii, container width, focus, and motion. The initial type stacks are Arial/Helvetica for body and Georgia/Times New Roman for display until approved fonts are available. The 4px spacing scale exposes 4, 8, 12, 16, 24, 32, and 48px steps. The page container caps at 1280px with a fluid 16–48px gutter. Text and controls use visible focus and a 44px minimum target. Use one primary action per region; do not rely on color alone for state.

The product grid starts at two columns and grows to three at 768px and four at 1024px. Product images use a 4:5 frame; use verified real imagery and useful alt text. At narrow widths, check long names, GHS prices, availability, and action labels without horizontal scroll. Validate at 320, 375, 390, 430, 768, 1024, and 1440px, with keyboard navigation and 200% zoom.

## Component contracts

| Pattern | Contract |
| --- | --- |
| Button | Primary, secondary, and quiet variants; loading announces busy and prevents repeats; active, focus, disabled states. |
| Link and navigation | Body links underline; current navigation uses `aria-current="page"`; menu controls expose expanded state. |
| Text field | Persistent label, associated hint/error, retained value after validation errors, disabled and focus states. |
| Product card | Verified identity, image, server-sourced GHS price, availability, and clear destination; no invented ratings or claims. |
| Content card and badge | Concise heading and one destination; text identifies status independently of hue. |
| Dialog and drawer | Use native dialog or an accessible primitive with focus containment, Escape handling, trigger focus restoration, and named heading. CSS alone does not implement these behaviors. |
| Empty/loading/error | Explain absence or failure in text; reserve loading space; provide recovery; use appropriate live announcement without repetition. |

The existing `Button`, `TextField`, `Badge`, `Alert`, and `EmptyState` are executable primitives. Shared CSS provides layout and visual styles for product cards, navigation, drawers, and dialogs; StorefrontAgent must implement their semantics and data contracts. DesignAgent and TestingAgent review actual pages and interaction states independently before signoff.
