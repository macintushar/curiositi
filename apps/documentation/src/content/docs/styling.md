---
title: Styling & Theming
description: Formal reference for styling across Curiositi (web + docs).
---

# Styling & Theming

Formal reference for styling across Curiositi (web + docs).

## Tailwind Adoption

- Web app uses Tailwind CSS v4 exclusively for layout, spacing, color, and component composition.
- Docs site integrates Tailwind on top of Docusaurus (Infima) by injecting `@tailwind base; @tailwind components; @tailwind utilities;` at the top of `custom.css`.

## Infima Coexistence

- Infima still provides baseline typography & layout classes in docs.
- Tailwind utilities override or augment as needed; avoid deep specificity wars.
- If conflict arises, prefer refactoring markup to rely solely on Tailwind classes instead of `!important` overrides.

## Design Tokens

Centralize color and spacing decisions using Tailwind config extensions (future improvement). Avoid scattering raw hex values; use semantic class groupings.

## Dark Mode

- Web uses dark mode via theme toggling (e.g., `dark:` variants).
- Docs leverage Docusaurus color mode plus Tailwind `dark:` utilities for consistent appearance.

## Component Patterns

- Favor small composable primitives (buttons, badges) parameterized by variant props (e.g., using `class-variance-authority`).
- Keep one responsibility per component; avoid embedding data fetching directly inside complex UI trees.

## Adding Custom Styles

1. Extend Tailwind config for new tokens (colors, spacing, fonts).
2. Create utility components rather than scattering identical class strings.
3. Use `@layer components` in a shared CSS file if a utility pattern becomes ubiquitous.

## Migration Strategy (If Removing Infima)

1. Audit usage of Infima global classes (`hero`, `button--*`).
2. Replace with Tailwind equivalents using a style mapping matrix.
3. Remove Infima variable overrides from `custom.css` once parity achieved.

## Performance Considerations

- Tailwind v4 JIT prunes unused classes based on content globs; ensure new doc paths are included if adding nested directories.
- Keep an eye on bundle size when introducing large third-party component libraries—prefer first-party composition.

## Accessibility

- Use semantic HTML first; styling should not obscure focus indicators.
- Ensure color contrast meets WCAG AA for both light and dark themes.
