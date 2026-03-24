import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Mock data (fictional — portfolio / demo only) ───────────────────────────

const SELLER = {
  name: 'Alex Rivera',
  brand: 'TrailBlaze Outdoors',
  plan: 'Premium',
  gmv: '$2.4M',
  asins: 18,
}

const AGENTS = [
  { id: 'ads', name: 'Ads Analysis Agent', desc: 'Campaigns, ACOS, bids, keywords', icon: '📊' },
  { id: 'inventory', name: 'Inventory Agent', desc: 'FBA levels, restock risk, velocity', icon: '📦' },
  { id: 'research', name: 'Research Agent', desc: 'Keywords, listing health, competitors', icon: '🔍' },
  { id: 'support', name: 'Human escalation', desc: 'Routes to support with full context', icon: '🙋' },
]

const SUGGESTED = [
  { id: 'acos', text: 'My ACOS jumped 40% this week — what happened?' },
  { id: 'stockout', text: 'Am I at risk of stocking out on any ASIN in the next 30 days?' },
  { id: 'marketShare', text: 'I want to analyze market share' },
]

const CATEGORIES = ['Bath', 'Bedding', 'Furniture', 'Event & Party Supplies', 'Adult Novelty', 'Party Favors']

const RESPONSES = {
  acos: {
    agentId: 'ads',
    agentName: 'Ads Analysis Agent',
    agentIcon: '📊',
    steps: [
      'Pulling campaign performance data (last 7 days)...',
      'Analyzing bid history and CPC trends...',
      'Cross-referencing competitor rank changes...',
      'Identifying root cause signals...',
    ],
    summary:
      'Your ACOS rose from 28.1% → 42.3% this week (+50.5%). I identified 3 contributing factors across your campaigns.',
    findings: [
      {
        sev: 'critical',
        title: 'Automated bid rule triggered on #1 keyword',
        badge: '34% of spend',
        body: "'Hiking hydration pack' bid increased $1.82 → $2.45 via your auto-optimisation rule (Monday). This keyword drives 34% of total spend — this change alone accounts for ~60% of the ACOS increase.",
      },
      {
        sev: 'warning',
        title: 'New competitor entered top 3 on primary keyword',
        badge: '↓12pts share',
        body: "CamelBak TrailMix moved to rank #2 on 'hiking hydration pack' Monday, increasing marketplace CPC by an estimated 18–22%. Your impression share dropped from 41% → 29%.",
      },
      {
        sev: 'warning',
        title: 'Summer Trail campaign exhausting daily budget by 2pm',
        badge: 'Budget cap hit',
        body: 'Daily budget ($85) depleting mid-afternoon. Late-day spend shifts to higher-cost secondary keywords — avg CPC in the 2–8pm window is up 31% vs. morning.',
      },
    ],
    actions: [
      { label: "Pause bid rule on 'hiking hydration pack'", v: 'primary' },
      { label: 'Increase Summer Trail budget → $140/day', v: 'secondary' },
      { label: 'Show full campaign breakdown →', v: 'ghost' },
    ],
  },

  stockout: {
    agentId: 'inventory',
    agentName: 'Inventory Agent',
    agentIcon: '📦',
    steps: [
      'Pulling FBA inventory levels across 18 ASINs...',
      'Calculating 7-day and 30-day sell-through velocity...',
      'Factoring in restock lead times...',
      'Projecting 30-day stockout risk...',
    ],
    summary:
      '3 of your 18 active ASINs are at risk of stocking out within 30 days. The Hydration Pack requires action today — you are past the reorder point.',
    findings: [
      {
        sev: 'critical',
        title: 'TrailBlaze Hydration Pack 2L — 12 days remaining',
        badge: '⚠ Past reorder',
        body: 'Velocity up +34% WoW (likely summer demand surge). Your restock lead time is 18 days. You are 6 days past the reorder point. Each day of delay significantly increases stockout probability.',
      },
      {
        sev: 'warning',
        title: 'TrailBlaze Trekking Poles — 21 days remaining',
        badge: 'Reorder in 7d',
        body: 'Current velocity is stable. Reorder within 7 days to maintain a safe buffer. Not an emergency today, but trending toward risk if velocity increases.',
      },
      {
        sev: 'info',
        title: 'Water Filter Straw — 28 days remaining',
        badge: 'Monitor',
        body: 'Velocity declining slightly (-8% WoW). Low immediate risk. Worth watching as peak summer season approaches — a demand spike could accelerate sell-through quickly.',
      },
    ],
    actions: [
      { label: 'Create restock order — Hydration Pack', v: 'primary' },
      { label: 'Set stockout alerts for all ASINs', v: 'secondary' },
      { label: 'View full inventory report →', v: 'ghost' },
    ],
  },

  marketShare: {
    agentId: 'research',
    agentName: 'Research Agent',
    agentIcon: '🔍',
    steps: [
      'Parsing intent: market share analysis...',
      'Checking required category context...',
      'Preparing clarification card (missing required information)...',
    ],
  },

  marketShareFull: {
    agentId: 'research',
    agentName: 'Research Agent',
    agentIcon: '🔍',
    steps: [
      'Loading category benchmarks...',
      'Aggregating Top 100 revenue and units...',
      'Synthesizing summary, implications, and next steps...',
    ],
  },
}

const MARKET_TABLE_REV = [
  ['1', 'B00MWENGGM · Example Brand', '$210,000', '6.6%'],
  ['2', 'B00MWENGGM · Brand Name', '$180,000', '5.8%'],
  ['3', 'B00MWENGGM · Brand Name', '$165,000', '5.5%'],
  ['4', 'B00MWENGGM · Brand Name', '$130,000', '5.0%'],
  ['5', 'B00MWENGGM · Brand Name', '$100,000', '4.8%'],
]

const MARKET_TABLE_UNITS = [
  ['1', 'B00MWENGGM · Brand Name', '8,420', '6.6%'],
  ['2', 'B00MWENGGM · Brand Name', '7,910', '5.8%'],
  ['3', 'B00MWENGGM · Brand Name', '7,295', '5.5%'],
  ['4', 'B00MWENGGM · Brand Name', '6,754', '5.0%'],
  ['5', 'B00MWENGGM · Brand Name', '5,325', '4.8%'],
]

// ─── PDF-inspired blocks (C1 clarification + C2 structured response) ───────

function ClarificationCard({ category, subcategory, onCategory, onSubcategory, onStart, disabled }) {
  return (
    <div className="max-w-lg rounded-2xl border border-sa-border bg-sa-surface p-5 shadow-sm">
      <p className="text-sm font-medium text-sa-text">Got it! You’re looking to analyze market share.</p>
      <p className="mt-2 text-sm text-sa-text-secondary">
        Can you tell me which category and subcategory you’d like to analyze?
      </p>
      <p className="mt-4 text-xs font-semibold tracking-wide text-sa-muted uppercase">
        Please select from the card below and submit.
      </p>
      <div className="mt-3 space-y-3">
        <div>
          <label className="text-xs font-medium text-sa-text-secondary" htmlFor="gpt-cat">
            Category
          </label>
          <select
            id="gpt-cat"
            value={category}
            onChange={(e) => onCategory(e.target.value)}
            className="mt-1 w-full rounded-lg border border-sa-border bg-sa-surface px-3 py-2 text-sm text-sa-text outline-none focus:border-sa-accent focus:ring-1 focus:ring-sa-accent"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-sa-text-secondary" htmlFor="gpt-sub">
            Subcategory
          </label>
          <select
            id="gpt-sub"
            value={subcategory}
            onChange={(e) => onSubcategory(e.target.value)}
            className="mt-1 w-full rounded-lg border border-sa-border bg-sa-surface px-3 py-2 text-sm text-sa-text outline-none focus:border-sa-accent focus:ring-1 focus:ring-sa-accent"
          >
            <option value="General">General</option>
            <option value="Party Favors">Party Favors</option>
            <option value="Living Room">Living Room</option>
            <option value="Outdoor">Outdoor</option>
          </select>
        </div>
        <p className="text-xs text-sa-text-secondary">
          Selecting a subcategory helps analyze market share more accurately.
        </p>
        <button
          type="button"
          onClick={onStart}
          disabled={disabled}
          className="w-full rounded-lg bg-sa-accent py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sa-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          Start analysis
        </button>
      </div>
    </div>
  )
}

function DataTable({ title, headers, rows }) {
  return (
    <div className="overflow-hidden rounded-xl border border-sa-border bg-sa-surface">
      <div className="border-b border-sa-border bg-sa-surface-raised px-3 py-2 text-xs font-semibold text-sa-text-secondary">
        {title}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[320px] text-left text-xs text-sa-text">
          <thead>
            <tr className="border-b border-sa-border bg-sa-surface-raised/80 text-sa-text-secondary">
              {headers.map((h) => (
                <th key={h} className="px-3 py-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-sa-border last:border-0">
                {row.map((cell, j) => (
                  <td key={j} className="px-3 py-2">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function MarketShareStructuredReport({ categoryLabel }) {
  const [tab, setTab] = useState('data')

  return (
    <div className="max-w-2xl space-y-4">
      <div className="inline-flex items-center gap-2 rounded-full border border-sa-border bg-sa-accent-soft px-3 py-1 text-xs font-semibold text-sa-accent">
        {categoryLabel}
      </div>
      <h3 className="text-base font-semibold text-sa-text">Here’s what stands out from this category 👇</h3>

      <section className="rounded-xl border border-sa-border bg-sa-surface p-4 shadow-sm">
        <h4 className="text-xs font-bold tracking-wide text-sa-muted uppercase">Summary</h4>
        <p className="mt-2 text-sm leading-relaxed text-sa-text">
          Home & Kitchen is a high-volume category, while {categoryLabel} is a smaller but high-revenue subcategory with
          concentrated yet contestable market share.
        </p>
      </section>

      <section className="rounded-xl border border-sa-border bg-sa-surface p-4 shadow-sm">
        <h4 className="text-xs font-bold tracking-wide text-sa-muted uppercase">Why this matters</h4>
        <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm text-sa-text-secondary">
          <li>Home & Kitchen accounts for a large share of marketplace GMV, driven by broad demand and frequent purchases.</li>
          <li>
            {categoryLabel} has fewer listings but higher ASPs, making it revenue-dense for focused sellers.
          </li>
          <li>Top listings capture outsized revenue share—often through ranking rather than brand loyalty alone.</li>
        </ul>
      </section>

      <section className="rounded-xl border border-sa-border bg-amber-50/80 p-4">
        <h4 className="text-xs font-bold tracking-wide text-amber-800 uppercase">Implication</h4>
        <p className="mt-2 text-sm text-amber-950">
          There’s room to win share through positioning, reviews, and fulfillment—without needing category-level scale.
        </p>
      </section>

      <div className="flex flex-wrap gap-2 border-b border-sa-border pb-2">
        {[
          { id: 'summary', label: 'Summary' },
          { id: 'data', label: 'Data' },
          { id: 'report', label: 'Report' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              tab === t.id ? 'bg-sa-accent text-white' : 'text-sa-text-secondary hover:bg-sa-surface-raised'
            }`}
          >
            {t.label}
          </button>
        ))}
        <span className="ml-auto hidden text-[10px] font-medium text-sa-muted sm:inline">
          Agent level → Recommend → Action
        </span>
      </div>

      {tab === 'summary' && (
        <p className="text-sm text-sa-text-secondary">
          High-level narrative for stakeholders. Switch to <strong>Data</strong> for tables or <strong>Report</strong> for
          export-style detail (demo).
        </p>
      )}
      {tab === 'data' && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-4 text-xs text-sa-text-secondary">
            <span>
              <strong className="text-sa-text">Total unit sales (Top 100):</strong> 125,000
            </span>
            <span>
              <strong className="text-sa-text">Total market revenue (Top 100):</strong> $3.2m
            </span>
            <span>
              <strong className="text-sa-text">Date:</strong> 01.01.2026 – 07.01.2026
            </span>
          </div>
          <DataTable title="Market share — revenue" headers={['Rank', 'Parent ASIN', 'Revenue (week)', 'Revenue share']} rows={MARKET_TABLE_REV} />
          <DataTable title="Market share — units" headers={['Rank', 'Parent ASIN', 'Units (week)', 'Revenue share']} rows={MARKET_TABLE_UNITS} />
        </div>
      )}
      {tab === 'report' && (
        <p className="text-sm text-sa-text-secondary">
          Report view would bundle charts and downloadable exports (not wired in this prototype).
        </p>
      )}

      <section className="rounded-xl border border-sa-border bg-sa-surface p-4 shadow-sm">
        <h4 className="text-xs font-bold tracking-wide text-sa-muted uppercase">Recommended next steps</h4>
        <p className="mt-2 text-sm text-sa-text-secondary">Based on this market share, here’s what I can help you do next:</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-sa-text">
          <li>Compare high-impact ASINs to find conversion and ranking gaps.</li>
          <li>Identify competitor pricing, review, and fulfillment weaknesses to leverage.</li>
          <li>Analyze ASIN-level concentration to see where share is easiest to win.</li>
        </ul>
      </section>

      <p className="text-sm font-medium text-sa-text">What would you like to explore next?</p>
      <div className="flex flex-wrap gap-2">
        {['Which ASINs are capturing share today?', 'Underestimated price segments or niches?', 'View deeper charts (optional)'].map((q) => (
          <button
            key={q}
            type="button"
            className="rounded-full border border-sa-border bg-sa-surface-raised px-3 py-1.5 text-xs text-sa-text-secondary transition-colors hover:border-sa-accent hover:text-sa-accent"
          >
            {q}
          </button>
        ))}
      </div>
      <p className="text-xs text-sa-muted">You can explore all of this in your seller suite (demo).</p>
    </div>
  )
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function SeverityCard({ finding }) {
  const cfg = {
    critical: {
      border: 'border-red-200',
      bg: 'bg-red-50',
      badge: 'bg-red-600',
      title: 'text-red-900',
      body: 'text-red-800',
    },
    warning: {
      border: 'border-amber-200',
      bg: 'bg-amber-50',
      badge: 'bg-amber-600',
      title: 'text-amber-900',
      body: 'text-amber-900/90',
    },
    info: {
      border: 'border-blue-200',
      bg: 'bg-blue-50',
      badge: 'bg-blue-600',
      title: 'text-blue-900',
      body: 'text-blue-900/90',
    },
  }[finding.sev]

  return (
    <div className={`rounded-xl border p-3 ${cfg.border} ${cfg.bg}`}>
      <div className="mb-1 flex items-start justify-between gap-2">
        <p className={`text-sm font-semibold leading-snug ${cfg.title}`}>{finding.title}</p>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap text-white ${cfg.badge}`}
        >
          {finding.badge}
        </span>
      </div>
      <p className={`text-xs leading-relaxed ${cfg.body}`}>{finding.body}</p>
    </div>
  )
}

function AgentMessage({ resp }) {
  return (
    <div className="flex max-w-2xl gap-3">
      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sa-accent text-lg text-white">
        {resp.agentIcon}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-sa-accent">{resp.agentName}</span>
          <span className="text-xs text-sa-muted">via Superagent · tool-grounded (demo)</span>
        </div>
        <p className="text-sm leading-relaxed text-sa-text">{resp.summary}</p>
        <div className="flex flex-col gap-2">
          {resp.findings.map((f, i) => (
            <SeverityCard key={i} finding={f} />
          ))}
        </div>
        <div className="mt-1 flex flex-wrap gap-2">
          {resp.actions.map((a, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {}}
              className={
                a.v === 'primary'
                  ? 'rounded-lg bg-sa-accent px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-sa-accent-hover'
                  : a.v === 'secondary'
                    ? 'rounded-lg border border-sa-border bg-sa-surface-raised px-4 py-2 text-xs font-medium text-sa-text transition-colors hover:bg-zinc-100'
                    : 'px-2 py-2 text-xs font-medium text-sa-accent transition-colors hover:text-sa-accent-hover'
              }
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function AssistantRow({ children }) {
  return (
    <div className="flex max-w-2xl gap-3">
      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sa-accent text-sm font-bold text-white">
        AI
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

function ThinkingIndicator({ phase, resp, thinkStep }) {
  if (!resp || (phase !== 'routing' && phase !== 'thinking')) return null
  return (
    <div className="flex max-w-2xl flex-col gap-1.5">
      <div className="ml-12 flex items-center gap-2">
        <span className="text-sm">{resp.agentIcon}</span>
        <span className="text-xs font-semibold text-sa-accent">{resp.agentName}</span>
        <span className="animate-pulse text-xs text-sa-accent">●</span>
      </div>
      {phase === 'routing' && (
        <p className="ml-12 animate-pulse text-xs text-sa-muted">Supervision agent routing query...</p>
      )}
      {phase === 'thinking' &&
        resp.steps.slice(0, thinkStep).map((step, i) => (
          <p
            key={i}
            className={`ml-12 text-xs transition-all ${i === thinkStep - 1 ? 'animate-pulse text-sa-text' : 'text-sa-muted'}`}
          >
            {i < thinkStep - 1 ? '✓ ' : '⟳ '}
            {step}
          </p>
        ))}
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function Superagent() {
  const [messages, setMessages] = useState([])
  const [phase, setPhase] = useState('idle')
  const [thinkStep, setThinkStep] = useState(0)
  const [activeResp, setActiveResp] = useState(null)
  const [activeAgentId, setActiveAgentId] = useState(null)
  const [usedPrompts, setUsedPrompts] = useState([])
  const [marketCategory, setMarketCategory] = useState('Furniture')
  const [marketSubcategory, setMarketSubcategory] = useState('Living Room')
  const [marketClarificationDone, setMarketClarificationDone] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, phase, thinkStep])

  const runThinkingSequence = useCallback((resp, onDone) => {
    setActiveResp(resp)
    setActiveAgentId(resp.agentId)
    setPhase('routing')
    setThinkStep(0)
    const maxStep = resp.steps.length

    const t1 = setTimeout(() => {
      setPhase('thinking')
      setThinkStep(1)
    }, 900)
    const stepTimers = []
    for (let s = 2; s <= maxStep; s++) {
      stepTimers.push(setTimeout(() => setThinkStep(s), 900 + (s - 1) * 700))
    }
    const tEnd = setTimeout(() => {
      setPhase('responding')
      onDone()
      setActiveAgentId(null)
      setTimeout(() => setPhase('idle'), 200)
    }, 900 + maxStep * 700 + 400)

    return () => {
      clearTimeout(t1)
      clearTimeout(tEnd)
      stepTimers.forEach(clearTimeout)
    }
  }, [])

  function handleSend(id, text) {
    if (phase !== 'idle') return

    if (id === 'marketShare') {
      const resp = RESPONSES.marketShare
      setUsedPrompts((p) => [...p, id])
      setMessages((prev) => [...prev, { role: 'user', text }])
      setMarketClarificationDone(false)

      const cleanup = runThinkingSequence(resp, () => {
        setMessages((prev) => [...prev, { role: 'agent', variant: 'clarification' }])
        cleanup()
      })
      return
    }

    const resp = RESPONSES[id]
    if (!resp || !resp.summary) return

    setUsedPrompts((p) => [...p, id])
    setMessages((prev) => [...prev, { role: 'user', text }])

    const cleanup = runThinkingSequence(resp, () => {
      setMessages((prev) => [...prev, { role: 'agent', resp }])
      cleanup()
    })
  }

  function handleMarketStartAnalysis() {
    if (phase !== 'idle') return
    const label = `${marketCategory} · ${marketSubcategory}`
    const resp = RESPONSES.marketShareFull
    setMessages((prev) => [...prev, { role: 'user', text: `Start analysis · ${label}` }])
    setMarketClarificationDone(true)

    const cleanup = runThinkingSequence(resp, () => {
      setMessages((prev) => [...prev, { role: 'agent', variant: 'marketReport', categoryLabel: marketCategory }])
      cleanup()
    })
  }

  const remainingSuggested = SUGGESTED.filter((s) => !usedPrompts.includes(s.id))

  return (
    <div className="flex h-screen flex-col bg-sa-canvas font-sans text-sa-text">
      <header className="flex shrink-0 items-center justify-between border-b border-sa-border bg-sa-surface px-6 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sa-accent text-sm font-bold text-white">
            S
          </div>
          <span className="font-semibold text-sa-text">Seller Suite</span>
          <span className="text-sa-border">·</span>
          <span className="font-medium text-sa-accent">GPT</span>
          <span className="ml-1 rounded-full bg-sa-accent-soft px-2 py-0.5 text-xs font-semibold text-sa-accent">
            Demo
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-sa-muted sm:inline">Ready when you are.</span>
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-900">
            ◆ {SELLER.plan}
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sa-accent text-sm font-bold text-white">
            A
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="flex w-64 shrink-0 flex-col gap-5 overflow-y-auto border-r border-sa-border bg-sa-surface p-4 shadow-sm">
          <div className="rounded-xl border border-sa-border bg-sa-surface-raised p-4">
            <p className="mb-1 text-xs tracking-widest text-sa-muted uppercase">Seller account</p>
            <p className="text-sm font-semibold text-sa-text">{SELLER.brand}</p>
            <p className="mb-3 text-xs text-sa-text-secondary">{SELLER.name}</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-sa-border bg-sa-surface p-2 text-center">
                <p className="text-sm font-bold text-sa-accent">{SELLER.gmv}</p>
                <p className="text-xs text-sa-muted">Ann. GMV</p>
              </div>
              <div className="rounded-lg border border-sa-border bg-sa-surface p-2 text-center">
                <p className="text-sm font-bold text-sa-accent">{SELLER.asins}</p>
                <p className="text-xs text-sa-muted">Active ASINs</p>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs tracking-widest text-sa-muted uppercase">Agent architecture</p>
            <div className="flex flex-col gap-2">
              <div
                className={`rounded-lg border p-3 transition-all duration-300 ${
                  phase !== 'idle' ? 'border-sa-accent bg-sa-accent-soft' : 'border-sa-border bg-sa-surface-raised'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🧠</span>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-xs font-semibold ${phase !== 'idle' ? 'text-sa-accent' : 'text-sa-text'}`}>
                      Supervision agent
                    </p>
                    <p className="text-xs text-sa-muted">Routes & orchestrates</p>
                  </div>
                  {phase !== 'idle' && <span className="animate-pulse text-xs text-sa-accent">●</span>}
                </div>
              </div>

              {AGENTS.map((agent) => (
                <div
                  key={agent.id}
                  className={`ml-3 rounded-lg border p-3 transition-all duration-300 ${
                    activeAgentId === agent.id ? 'border-sa-accent bg-sa-accent-soft' : 'border-sa-border bg-sa-surface-raised'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{agent.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate text-xs font-medium ${
                          activeAgentId === agent.id ? 'text-sa-accent' : 'text-sa-text-secondary'
                        }`}
                      >
                        {agent.name}
                      </p>
                      <p className="truncate text-xs text-sa-muted">{agent.desc}</p>
                    </div>
                    {activeAgentId === agent.id && <span className="animate-pulse text-xs text-sa-accent">●</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto rounded-xl border border-sa-border bg-sa-surface-raised p-3">
            <p className="text-xs leading-relaxed text-sa-muted">
              UI patterns mirror a shared PDF spec (clarification card + structured C2). Fictional data only.
            </p>
          </div>
        </aside>

        <main className="flex flex-1 flex-col overflow-hidden bg-sa-canvas">
          <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-6">
            {messages.length === 0 && phase === 'idle' && (
              <div className="flex flex-1 flex-col items-center justify-center gap-5 py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sa-accent text-3xl text-white shadow-md">
                  🧠
                </div>
                <div>
                  <h2 className="mb-2 text-xl font-semibold text-sa-text">Superagent</h2>
                  <p className="max-w-md text-sm leading-relaxed text-sa-text-secondary">
                    Web-app style chat: intent clarification when required, then structured answers with data tabs and
                    recommended next steps.
                  </p>
                </div>
                <div className="mt-2 flex w-full max-w-lg flex-col gap-2">
                  {SUGGESTED.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSend(s.id, s.text)}
                      className="rounded-xl border border-sa-border bg-sa-surface px-4 py-3 text-left text-sm text-sa-text shadow-sm transition-all hover:border-sa-accent/40 hover:shadow"
                    >
                      {s.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i}>
                {msg.role === 'user' ? (
                  <div className="flex justify-end">
                    <div className="max-w-lg rounded-2xl rounded-tr-sm bg-sa-accent px-4 py-3 text-sm leading-relaxed text-white shadow-sm">
                      {msg.text}
                    </div>
                  </div>
                ) : msg.variant === 'clarification' ? (
                  <AssistantRow>
                    <ClarificationCard
                      category={marketCategory}
                      subcategory={marketSubcategory}
                      onCategory={setMarketCategory}
                      onSubcategory={setMarketSubcategory}
                      onStart={handleMarketStartAnalysis}
                      disabled={phase !== 'idle' || marketClarificationDone}
                    />
                  </AssistantRow>
                ) : msg.variant === 'marketReport' ? (
                  <AssistantRow>
                    <MarketShareStructuredReport categoryLabel={msg.categoryLabel || 'Category'} />
                  </AssistantRow>
                ) : (
                  <AgentMessage resp={msg.resp} />
                )}
              </div>
            ))}

            <ThinkingIndicator phase={phase} resp={activeResp} thinkStep={thinkStep} />

            <div ref={bottomRef} />
          </div>

          <div className="shrink-0 border-t border-sa-border bg-sa-surface px-6 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
            {messages.length > 0 && phase === 'idle' && remainingSuggested.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {remainingSuggested.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSend(s.id, s.text)}
                    className="rounded-full border border-sa-border bg-sa-surface-raised px-3 py-1.5 text-xs text-sa-text-secondary transition-all hover:border-sa-accent/50"
                  >
                    {s.text.length > 55 ? `${s.text.slice(0, 55)}…` : s.text}
                  </button>
                ))}
              </div>
            )}

            <div
              className={`flex items-center gap-3 rounded-xl border bg-sa-surface-raised px-4 py-3 transition-colors ${
                phase !== 'idle' ? 'border-sa-accent' : 'border-sa-border'
              }`}
            >
              <input
                className="flex-1 bg-transparent text-sm text-sa-text placeholder-zinc-400 outline-none"
                placeholder={phase !== 'idle' ? 'Assistant is thinking…' : 'Ask anything about your business…'}
                disabled={phase !== 'idle'}
                aria-label="Message"
              />
              <button
                type="button"
                disabled={phase !== 'idle'}
                className="text-sa-accent transition-colors hover:text-sa-accent-hover disabled:opacity-30"
                aria-label="Send"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            <p className="mt-2 text-center text-xs text-sa-muted">
              Portfolio prototype · fictional data · PDF spec used for layout patterns only
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
