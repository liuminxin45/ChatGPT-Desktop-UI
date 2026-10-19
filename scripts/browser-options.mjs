/** Match CI's bundled Chromium install while retaining the Windows Edge default. */
export function browserOptions(channel = process.env.UI_BROWSER_CHANNEL || 'msedge') {
  return { headless: true, ...(channel === 'chromium' ? {} : { channel }) };
}
