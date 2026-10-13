import assert from 'node:assert/strict';
import { test } from 'node:test';
import { browserOptions } from '../scripts/browser-options.mjs';

test('uses Edge by default and follows the configured browser', () => {
  const previous = process.env.UI_BROWSER_CHANNEL;
  try {
    delete process.env.UI_BROWSER_CHANNEL;
    assert.deepEqual(browserOptions(), { headless: true, channel: 'msedge' });
    process.env.UI_BROWSER_CHANNEL = 'chrome';
    assert.deepEqual(browserOptions(), { headless: true, channel: 'chrome' });
    process.env.UI_BROWSER_CHANNEL = 'chromium';
    assert.deepEqual(browserOptions(), { headless: true });
    process.env.UI_BROWSER_CHANNEL = '';
    assert.deepEqual(browserOptions(), { headless: true, channel: 'msedge' });
  } finally {
    if (previous === undefined) delete process.env.UI_BROWSER_CHANNEL;
    else process.env.UI_BROWSER_CHANNEL = previous;
  }
});
