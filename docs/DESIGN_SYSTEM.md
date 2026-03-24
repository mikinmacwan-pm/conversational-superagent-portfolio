# Plugging in your design system

This prototype uses **Tailwind CSS v4** with a small set of **custom tokens** in `src/index.css` (`@theme`). That is the seam where your company UI kit or Figma variables map in.

**Custom GPT.pdf (attached spec):** That file was ingested as **extracted text**, not as a Figma file—so layout, copy structure, and light “web app” chrome were approximated. For **pixel-perfect** parity, share a **figma.com** link (or exported variables) and we can align spacing, type scale, and components to the frame.

## How you can share design system input

Pick what is allowed for your situation:

1. **CSS variables / tokens**  
   Paste a flat list (hex or OKLCH) for: primary, surfaces, borders, text, success/warning/error. I (or you) map them into the `@theme { ... }` block in `src/index.css`.

2. **Figma**  
   Share a **public** file or exported **variables** (JSON/CSS) — not internal-only links if this repo will be public. I can align spacing, radii, and colors to match.

3. **Internal npm package** (e.g. `@org/components` + CSS)  
   You install it locally; we wrap or replace raw markup with your `Button`, `Card`, `Badge`, etc., and delete duplicate Tailwind where the component handles styling.

4. **Screenshots + annotations**  
   You mark header, sidebar, chat bubble, chips — I tune classes/tokens to visually match (slower but works when tokens cannot leave the VPN).

## Tokens this demo already expects

| Token (Tailwind) | Role |
|------------------|------|
| `sa-accent`, `sa-accent-hover`, `sa-accent-muted` | Primary brand actions and highlights |
| `sa-canvas`, `sa-surface`, `sa-surface-raised` | App background and panels |
| `sa-border`, `sa-muted` | Borders and secondary text (partially still `gray-*` — can consolidate) |

Severity cards (red / amber / blue) are still generic Tailwind; replace with your semantic **danger / warning / info** tokens when you have them.

## What not to put in a public repo

Do not commit proprietary token dumps, private Storybook URLs, or full internal design docs. Use sanitized exports or recreate values manually.
