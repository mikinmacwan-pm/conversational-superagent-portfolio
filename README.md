# Conversational superagent — portfolio prototype

**Independent UI prototype** for a multi-agent marketplace assistant: intent routing, clarification when context is missing, structured answers (summary · data · report), and **insight → action** affordances. All data is **fictional**; this repo is **not** affiliated with any employer and does not contain proprietary code or datasets.

<!-- Optional: add a screenshot or GIF here -->
<!-- ![Demo](docs/screenshot.png) -->

## See the demo

**GitHub only hosts this repository’s files** — it does not run the React app in the browser. Visitors land on the repo page and see code unless you give them another way in:

| How | What people do |
|-----|----------------|
| **Hosted site (recommended)** | Open a **live URL** after you deploy (Vercel, Netlify, Cloudflare Pages, etc.). *Add that link on the line below when you have it — recruiters can click it with zero setup.* |
| **Run locally** | Clone the repo, run `npm install` and `npm run dev`, open the local URL (see [Tech & run locally](#tech--run-locally)). |

**Live demo:** *Not deployed yet — add your URL here, e.g.* `https://your-app.vercel.app`

**Clone this repo:**

```bash
git clone https://github.com/mikinmacwan-pm/conversational-superagent-portfolio.git
cd conversational-superagent-portfolio
```

---

## At a glance

| | |
|---|---|
| **Stack** | React (Vite), Tailwind CSS v4 |
| **Focus** | Agentic UX, supervision + specialist agents, grounded-style responses (mock), evaluation-friendly flows |

---

## What this prototype shows

- **Supervision → specialist routing** — A supervision layer conceptually routes user intent; the sidebar reflects which sub-agent is active during a turn.
- **Multi-step conversations** — Example: *market share* triggers a **C1-style clarification** (category / subcategory) before a **C2-style structured response** (narrative, implications, tabbed **Summary · Data · Report**, tables, recommended next steps, follow-up chips).
- **Insight → action** — Primary / secondary / ghost actions on agent messages (e.g. ads, inventory scenarios) to mirror executable next steps, not chat-only answers.
- **Design-system ready** — Tokens live in `src/index.css` (`@theme`) so colors, surfaces, and type can be swapped for a real system. See `docs/DESIGN_SYSTEM.md`.

Together, these patterns mirror how I think about **coordinated intelligent systems** in product: not one-off chat, but **orchestration**, **persistent session context**, and **reusable interaction primitives** across workflows.

---

## Background (why this problem space)

I lead **platform strategy for agentic AI** in a **multi-marketplace ecommerce SaaS** environment serving global brands and agencies. My scope centers on a **foundational AI layer** that turns isolated AI features into **coordinated systems**: agent-to-agent orchestration, durable user context across sessions, and **platform primitives** that multiple products can reuse.

Areas I own or drive include:

- Multi-agent workflows and **insight → action** routing  
- **Persistent cross-session** user intelligence and personalization architecture  
- **Cross-marketplace** insight and execution (e.g. unified narratives across major retail channels)  
- AI copilots and embedded knowledge to **reduce support load** and improve self-serve  
- **Structured data capture** loops that improve downstream model and workflow quality  

I care about **measurable** outcomes: activation, cross-product adoption, workflow completion, and AI-powered self-serve engagement.

This repository is a **public, sanitized sketch** of the UX and product patterns above—intended for discussion with recruiters and hiring managers, not as a representation of any company’s production system.

---

## Tech & run locally

```bash
npm install
npm run dev
```

Then open the URL shown in the terminal (typically `http://localhost:5173/`).

```bash
npm run build   # production build
npm run preview # serve dist locally
```

---

## Try these flows in the demo

1. **Ads / ACOS** — Structured findings with severity, narrative summary, and action buttons.  
2. **Inventory / stockout** — Same pattern, different agent.  
3. **Market share** — Full **clarify → submit → structured report** path with tabs and tables (mock data).

---

## Repo layout

| Path | Purpose |
|------|---------|
| `src/Superagent.jsx` | Main UI, mock agents, scripted responses |
| `src/index.css` | Tailwind + design tokens (`@theme`) |
| `docs/DESIGN_SYSTEM.md` | How to plug in a real design system |

---

## Product notes (interview hooks)

- **Quality bar** — In production I’d pair this UX with a **golden-prompt / eval harness**, human rubrics for “grounded vs harmful,” and latency SLOs.  
- **Trust & safety** — Explicit escalation paths, citation of tool outputs, and conservative behavior when data is missing.  
- **Metrics** — Task completion, time-to-first-action, return rate to the assistant, and deflection from human support where appropriate.

---

## License

[MIT](LICENSE)

---

## Contact

**Mikin Macwan** — [LinkedIn](https://www.linkedin.com/in/mikin-macwan/) · [macwan.mikin@gmail.com](mailto:macwan.mikin@gmail.com)
