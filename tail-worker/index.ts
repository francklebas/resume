export interface Env {
  DISCORD_WEBHOOK_URL: string
}

interface TraceException {
  name: string
  message: string
  timestamp: number
}

interface TraceItem {
  scriptName: string | null
  outcome: string
  eventTimestamp: number
  event: {
    request?: { url: string, method: string }
    response?: { status: number }
  } | null
  exceptions: TraceException[]
}

// Reçoit les traces du Worker "resumes" (voir tail_consumers dans wrangler.jsonc) et notifie
// Discord pour toute exécution qui plante (outcome != 'ok') ou renvoie une erreur serveur (5xx) —
// `outcome` seul ne suffit pas : un createError(500) géré par Nitro reste "ok" côté runtime.
export default {
  async tail(events: TraceItem[], env: Env) {
    const failures = events.filter(e => e.outcome !== 'ok' || (e.event?.response?.status ?? 200) >= 500)
    await Promise.all(failures.map(event => notify(event, env)))
  },
}

async function notify(event: TraceItem, env: Env) {
  const url = event.event?.request?.url ?? 'inconnu'
  const method = event.event?.request?.method ?? ''
  const status = event.event?.response?.status
  const exceptionLines = event.exceptions.map(e => `${e.name}: ${e.message}`).join('\n') || `outcome: ${event.outcome}`

  const content = [
    `🔴 **${event.scriptName ?? 'resumes'}** — ${status ? `HTTP ${status}` : event.outcome}`,
    `${method} ${url}`.trim(),
    '```',
    exceptionLines.slice(0, 1500),
    '```',
  ].join('\n')

  await fetch(env.DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })
}
