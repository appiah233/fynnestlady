# Design Direction

Status: **DesignAgent foundation; visual execution requires catalogue assets and a dedicated review before implementation.**

## Experience Intent

Premium, warm, refined, modern, knowledgeable, personal, and distinctly skincare-focused. The experience should feel editorial and calm while keeping product purpose, price, use, warnings, availability, and actions easy to find.

## Human Goals

Customers should quickly understand what is sold, why Fynnestlady is trustworthy, and how to explore products by need without feeling diagnosed or pressured. Administrators should complete high-impact tasks confidently with preview, validation, confirmation, and recovery states.

## System Direction

- Establish semantic design tokens for color, typography, spacing, radius, elevation, motion, and layout before page styling.
- Use a restrained warm-neutral palette with accessible contrast; brand color and typography require owner approval and tested licensing/loading.
- Prioritize high-quality real product photography with consistent ratios and meaningful alternatives. Do not use misleading generated product imagery.
- Build semantic, composable controls and commerce patterns; shadcn/ui may provide accessible primitives but must not dictate a generic visual identity.
- Motion is purposeful, subtle, and reduced-motion aware; gradients and decorative effects are sparing.

## Responsive and Accessibility Baseline

Design mobile-first and verify 320px, 375/390px, tablet, common laptop, desktop, and large desktop. Target WCAG 2.2 AA with logical headings, keyboard access, visible focus, adequate target size, robust labels/errors, zoom/reflow, contrast, and non-color status cues.

## Required States

Every interactive pattern defines default, hover where applicable, focus, active, disabled, loading, empty, success, warning, and error states. Cart/checkout protects input during recoverable errors and clearly distinguishes pending payment from paid.

## Design Review Checklist

DesignAgent critiques hierarchy, typography, spacing, consistency, trust, accessibility, mobile usability, content clarity, conversion and checkout friction, empty/loading/error states, focus, and keyboard behavior. No UI implementation starts from the homepage hypothesis alone.
