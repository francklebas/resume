import type { H3Event } from 'h3'

/**
 * Rend une URL en PDF A4.
 * - Dev : puppeteer complet avec le Chromium local.
 * - Prod (Cloudflare Workers) : @cloudflare/puppeteer via le binding Browser Rendering `BROWSER`.
 * La branche dev est éliminée du bundle prod (import.meta.dev), puppeteer n'y est jamais embarqué.
 */
export async function renderUrlToPdf(event: H3Event, url: string): Promise<Uint8Array> {
  if (import.meta.dev) {
    const { default: puppeteer } = await import('puppeteer')
    const browser = await puppeteer.launch()
    try {
      return await renderWith(browser, url)
    }
    finally {
      await browser.close()
    }
  }

  const puppeteer = await import('@cloudflare/puppeteer')
  const binding = event.context.cloudflare?.env?.BROWSER
  if (!binding) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Binding Browser Rendering « BROWSER » absent (wrangler.jsonc)',
    })
  }
  const browser = await puppeteer.launch(binding)
  try {
    return await renderWith(browser, url)
  }
  finally {
    await browser.close()
  }
}

interface PdfBrowser {
  newPage: () => Promise<{
    goto: (url: string, options: { waitUntil: 'networkidle0' }) => Promise<unknown>
    pdf: (options: { format: 'A4', printBackground: boolean, margin: Record<string, number> }) => Promise<Uint8Array>
  }>
}

async function renderWith(browser: PdfBrowser, url: string): Promise<Uint8Array> {
  const page = await browser.newPage()
  await page.goto(url, { waitUntil: 'networkidle0' })
  return page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  })
}
