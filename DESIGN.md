# Rainy Notes Design System

## 1. Atmosphere & Identity

`rainy-notes` / `안개비` is a quiet personal writing space. The signature is a dark rainy canvas that stays behind the text: rain, glass, and sound may set the mood, but reading always wins.

## 2. Color

These tokens are extracted from `src/styles/global.css` and are the source of truth for later UI work.

| Role | Token | Value | Usage |
|---|---|---:|---|
| Canvas | `--color-bg` | `#121315` | Page background and rainy night base |
| Canvas soft | `--color-bg-soft` | `#191c1f` | Subtle background lift |
| Surface | `--color-surface` | `rgb(246 241 232 / 5%)` | Quiet glass surfaces |
| Surface strong | `--color-surface-strong` | `rgb(246 241 232 / 8%)` | Slightly stronger glass layer |
| Text | `--color-text` | `#f0ede7` | Primary body and headings |
| Text muted | `--color-text-muted` | `#bdb7ac` | Dates, metadata, summaries |
| Text subtle | `--color-text-subtle` | `#8e8a82` | Low-priority labels |
| Border | `--color-border` | `rgb(246 241 232 / 12%)` | Soft dividers and boxes |
| Border strong | `--color-border-strong` | `rgb(246 241 232 / 22%)` | Focused or emphasized outlines |
| Link | `--color-link` | `#c8dce1` | Inline links |
| Link hover | `--color-link-hover` | `#edf8fa` | Link hover |
| Accent | `--color-accent` | `#d1a15f` | Sparse warm emphasis |
| Accent muted | `--color-accent-muted` | `#a9824d` | Secondary warm emphasis |
| Focus | `--color-focus` | `#e2b36f` | Keyboard focus rings |

Orb palette rule: post orbs should stay inside the existing rainy palette: deep canvas tokens, warm accent glints, pale text-tinted glass, and cool link mist. Do not add decorative purple, neon, or brand-red orb colors without updating this file first.

## 3. Typography

Font families come from `src/styles/global.css`.

| Role | Token | Stack | Usage |
|---|---|---|---|
| Heading | `--font-heading` | `"Paperlogy", "Pretendard Local", -apple-system, BlinkMacSystemFont, system-ui, sans-serif` | Page titles and major headings |
| Sans | `--font-sans` | `"Pretendard Local", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, "Apple SD Gothic Neo", "Noto Sans KR", "Segoe UI", sans-serif` | Body, navigation, metadata |
| Mono | `--font-mono` | `"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace` | Code and technical inline text |

Text-first rule: headings, summaries, dates, tags, and body copy must remain readable before any rain, orb, glass, or motion treatment is considered successful.

## 4. Spacing & Layout

The spacing scale is already defined as rem tokens.

| Token | Value |
|---|---:|
| `--space-1` | `0.25rem` |
| `--space-2` | `0.5rem` |
| `--space-3` | `0.75rem` |
| `--space-4` | `1rem` |
| `--space-5` | `1.5rem` |
| `--space-6` | `2rem` |
| `--space-7` | `3rem` |
| `--space-8` | `4rem` |

Layout tokens: `--content-width: 44rem`, `--page-width: 66rem`, `--nav-height: 4.75rem`. Radius tokens: `--radius-sm: 0.25rem`, `--radius-md: 0.5rem`. Keep post-reading layouts constrained to content width unless a decorative background layer explicitly needs page width.

## 5. Components

### Post orb glass box

- Structure: native `<a>` post orbs are compact post navigation items inside one quiet glass container; the visible orb surface stays textless so the ball remains small and tappable.
- Spacing: use `--space-4` to `--space-6` for internal padding and `--space-5` to `--space-7` between repeated post boxes.
- Surface: use `--color-surface`, `--color-surface-strong`, `--color-border`, and `--shadow-soft`; keep `--radius-md` as the maximum normal radius.
- Content: the anchor keeps an accessible label for the post title. The date, category, and description are intentionally omitted from the visible orb surface; desktop hover or focus may show a short title tooltip.
- States: hover may lift contrast slightly through existing surface/border tokens; focus must use `--color-focus`.
- Accessibility: orbs must keep native link behavior, visible keyboard focus, and usable reduced-motion/static fallback. Decorative layers inside or behind the anchor must not intercept pointer events.

## 6. Motion & Interaction

Use motion sparingly. Rain and orb movement should animate only `transform` and `opacity`, matching the existing product rule that browser animation primitives do the work instead of per-frame layout changes.

Reduced motion: respect `prefers-reduced-motion`; stop or minimize non-essential rain/orb movement, and never replace readability with animation.

Focus/accessibility: every interactive post box, link, and audio control needs visible keyboard focus using `--color-focus`, sufficient contrast, and no autoplay audio. Motion and sound remain user-controlled.

## 7. Depth & Surface

Depth strategy: mixed tonal glass, but quiet. Use dark canvas tokens for the base, low-alpha warm surfaces for glass, soft borders for separation, and `--shadow-soft` only when the surface must separate from rain. Do not create a full brand redesign or introduce unrelated CSS tokens just for a post-orb experiment.
