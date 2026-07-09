---
name: design-direction
version: 1.0.0
description: |
  House visual-design system for Jon Marc Patton's portfolio apps built with
  Claude Code + Next.js/React + Tailwind. Encodes the "Quiet Authority"
  aesthetic established in CARRavan so every new build inherits the same
  palette, radius, typography, and design principles instead of reaching for
  generic AI defaults. Use whenever building or restyling UI. Two layers:
  HOUSE STYLE (stable, applies to every app) and PER-APP NOTES (swappable,
  rewritten per project).
license: MIT
compatibility: any-agent
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
---

# Design Direction: Quiet Authority

You are building tools with two audiences in mind, and they are not the same
people:

1. **The users who operate the tool** — often working practitioners (CSMs,
   project managers, sales reps, analysts) doing a task under time pressure.
   The *interface* serves them: fast, clear, low-friction, nothing that needs
   training to figure out.
2. **The people who receive the tool's output** — frequently more senior
   (a customer, a decision-maker). Any *generated document or deliverable*
   should look polished and credible enough to put in front of them.

The visual target is restrained, precise, and credible. Think Linear, Stripe,
Vercel, and a clean business deliverable — not a bright consumer app, but also
not an intimidating enterprise cockpit. When a choice is between "flashy" and
"understated," choose understated. When a choice is between "impressive" and
"easy to use," the interface chooses easy.

The single most important rule: **do not reach for generic defaults.** Every
color, radius, and font below is deliberate. Use these values verbatim. If you
find yourself picking a default Tailwind blue, a default border radius, or a
stock font, stop — the values are already specified here.

---

## LAYER 1 — HOUSE STYLE (stable; every app inherits this unchanged)

### Colors

All colors are in **oklch** format and must stay in oklch. Do not convert to
hex — conversion introduces drift and breaks consistency with the source
system. These are the exact values from the established design system.

Light mode is the default and, for most tools, the only mode. Do not add a
dark mode unless the per-app notes explicitly ask for one.

```css
:root {
  --radius: 0.5rem;

  /* Surfaces */
  --background: oklch(0.99 0.002 260);   /* near-white, faint cool tint */
  --foreground: oklch(0.18 0.02 260);    /* near-black text */
  --card: oklch(1 0 0);                  /* pure white cards */
  --card-foreground: oklch(0.18 0.02 260);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.18 0.02 260);

  /* Corporate blue — confident, slightly muted. The one accent. */
  --primary: oklch(0.5 0.16 264);
  --primary-foreground: oklch(0.99 0.003 260);

  /* Neutrals */
  --secondary: oklch(0.965 0.005 260);
  --secondary-foreground: oklch(0.22 0.02 260);
  --muted: oklch(0.965 0.005 260);
  --muted-foreground: oklch(0.5 0.02 260);
  --accent: oklch(0.95 0.02 264);
  --accent-foreground: oklch(0.3 0.12 264);

  /* Status */
  --destructive: oklch(0.55 0.18 27);    /* at-risk red, desaturated */
  --destructive-foreground: oklch(0.99 0.003 260);

  /* Lines & focus */
  --border: oklch(0.92 0.006 260);
  --input: oklch(0.92 0.006 260);
  --ring: oklch(0.5 0.16 264);

  /* Charts — sequence starts with primary blue */
  --chart-1: oklch(0.5 0.16 264);
  --chart-2: oklch(0.55 0.12 200);
  --chart-3: oklch(0.6 0.13 150);
  --chart-4: oklch(0.7 0.14 70);
  --chart-5: oklch(0.55 0.15 25);

  /* Dark sidebar chrome — the "Quiet Authority" signature */
  --sidebar: oklch(0.2 0.008 260);       /* dark charcoal */
  --sidebar-foreground: oklch(0.92 0.005 260);
  --sidebar-primary: oklch(0.58 0.17 264);
  --sidebar-primary-foreground: oklch(0.99 0.003 260);
  --sidebar-accent: oklch(0.28 0.012 260);
  --sidebar-accent-foreground: oklch(0.98 0.003 260);
  --sidebar-border: oklch(0.3 0.01 260);
  --sidebar-ring: oklch(0.58 0.17 264);
}
```

**How to use the palette:**

- **One accent, used sparingly.** The corporate blue (`--primary`) is the only
  accent. It goes on primary buttons, active nav, links, and the first chart
  series. Do not introduce a second accent color. Restraint is the aesthetic.
- **Dark chrome, light content.** If the app has a sidebar or top chrome, it is
  dark charcoal (`--sidebar`). The content area is always light
  (`--background`). Never flip the content area to dark. This charcoal-frame /
  light-body contrast is the signature of the look — keep it consistent across
  every screen.
- **Status colors stay desaturated.** At-risk is the muted red
  (`--destructive`), healthy is the green chart tone (`--chart-3`). Never use
  bright/neon status colors — they read as consumer, not executive.
- **Neutrals do the heavy lifting.** Most of the interface is white, near-white,
  and the grey neutrals. Color is the exception, not the rule.

### Radius

Base radius is `0.5rem` (8px) — tight, not pill-shaped, not sharp. The scale is
derived from it:

```css
--radius-sm: calc(var(--radius) - 4px);   /* 4px */
--radius-md: calc(var(--radius) - 2px);   /* 6px */
--radius-lg: var(--radius);               /* 8px */
--radius-xl: calc(var(--radius) + 4px);   /* 12px */
```

Use `md`/`lg` for most cards and buttons. Avoid large pill radii except on
genuinely pill-shaped elements (tags, toggles).

### Typography

- **UI / interface: Inter.** Buttons, labels, form fields, nav, dashboard
  headings. Clean, executive, neutral. Load from Google Fonts.
- **Weights:** regular (400) for body, medium (500) for labels and nav, semibold
  (600) for headings. Avoid heavy/black weights — they read as loud.
- **Numbers that matter get emphasis.** When displaying key metrics (KPIs,
  totals, percentages), make them visually dominant through size and weight, not
  color. Let the number be the loudest thing on the card.

### Layout & spacing principles

- **Generous white space.** Crowding reads as cheap. When in doubt, add
  breathing room. Consulting-deliverable density, not dashboard-cram.
- **Restraint over decoration.** No gradients-for-the-sake-of-gradients, no
  drop-shadows stacked three deep, no decorative illustration. A subtle border
  or a single soft shadow is enough to separate a card from the background.
- **Alignment is discipline.** Consistent gutters, consistent card padding,
  everything on a grid. Misalignment is the fastest way to look unfinished.
- **Responsive by default.** Every layout works on desktop, tablet, and mobile.
  Test the narrow viewport, don't assume it.

### Usability principles (the interface serves working practitioners)

The people operating these tools are doing a job, not admiring a dashboard.
The interface earns its keep by getting out of their way.

- **Low friction beats impressive.** Minimize required steps, clicks, and
  fields. If a step can be skipped or defaulted, skip or default it. Data-entry
  friction is the fastest way to kill adoption of a tool like this.
- **The primary action is obvious.** On any screen, the main thing the user is
  there to do (paste notes, generate, export) is the most prominent control.
  Don't bury it among equal-weight buttons.
- **No training required.** Labels are plain and task-oriented. A first-time
  user should understand what to do without a tooltip or a manual.
- **Clear states.** Show loading, empty, error, and success states explicitly.
  A practitioner should never be left wondering whether the tool is working.

### What NOT to do (house-style violations)

- Do not use a default Tailwind color (`bg-blue-600`, `bg-slate-800`, etc.).
  Use the semantic tokens above.
- Do not add a second accent color "for variety."
- Do not make the content area dark.
- Do not use bright/saturated status colors.
- Do not stack heavy shadows or gradients to add visual interest — the interest
  comes from typography, spacing, and restraint.
- Do not crowd. If it feels dense, it is.

---

## LAYER 2 — PER-APP NOTES (swappable; rewrite this section per project)

> Replace everything in this section when starting a new app. Layer 1 above
> stays untouched.

### Current app: Proposal Generator

A tool that turns discovery-call notes into a formatted, three-tier client
proposal (Baseline / Recommended / Premium).

**Who uses it:** customer-facing practitioners — CSMs, project managers, and
sales reps — building proposals during or after a customer engagement. They are
the interface's audience: they want to paste their notes, get a solid draft
proposal, and move on. Speed and low friction matter more than any bell or
whistle.

**Who receives the output:** the customer. The generated proposal is sent to
them, so the document itself should look professional and client-ready, even
though the tool that made it is a quick internal utility.

Input: pasted or uploaded discovery notes, plus an optional logo image. Output:
a clean, client-ready proposal document that can be exported to PDF.

**App-specific design rules:**

- **The output is a document, not a web page.** The generated proposal should
  read like a finished business deliverable. Set the **proposal body text in a
  serif** (Georgia, or Source Serif from Google Fonts) while keeping the app's
  own interface (form, buttons, controls) in Inter. This sans-serif-chrome /
  serif-document split visually separates "the tool" from "the thing it made"
  and makes the output look credible to the customer receiving it.
- **Logo placement.** If the user uploads a logo, it sits at the top of the
  proposal, left-aligned or centered, at a restrained size — it anchors the
  document, it is not a banner.
- **Three tiers, visually parallel.** The Baseline / Recommended / Premium
  options should be visually equal in weight, with the Recommended tier given
  one subtle signal of emphasis (a thin primary-blue top border or a small
  "Recommended" tag in primary blue) — never a loud "BEST VALUE!" treatment.
- **Print/PDF fidelity.** The proposal view must export to PDF cleanly: readable
  margins, no clipped content, the serif body preserved. Design the proposal
  view as if it will be printed, because it will be.
- **Keep the tool chrome minimal.** This is a single-purpose tool. Input on one
  side, generated proposal on the other (or input-then-output flow). Do not
  build a dashboard shell it doesn't need.

---

## Applying this file

1. On any UI build or restyle, read this file first and treat Layer 1 as
   non-negotiable.
2. Set the CSS custom properties from Layer 1 into the project's global
   stylesheet before building components.
3. Build components against the semantic tokens, never against raw color values.
4. Check output against the "What NOT to do" list before considering a screen
   done.
