import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { createGalleryServer } from './serve.mjs';
import { root, families } from './component-catalog.mjs';
const server = createGalleryServer('examples/catalog/build', [
  'index.html',
  'app.js',
  'app.css',
  'utilities.css',
]);
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const channel = process.env.UI_BROWSER_CHANNEL || 'msedge';
const browser = await chromium.launch({ headless: true, ...(channel === 'chromium' ? {} : { channel }) });
const cases = [];
const errors = [];
try {
  for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: theme });
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    const navigation = page.getByRole('navigation', { name: 'Component families' });
    for (const family of Object.keys(families)) {
      await navigation.getByRole('button', { name: family, exact: true }).click();
      await page.getByRole('heading', { level: 2, name: family, exact: true }).waitFor();
      // Contrast measurements must use the settled surface, not its entrance fade.
      await page.locator('.reference-preview').evaluate(async (element) => {
        await Promise.all(
          element
            .getAnimations({ subtree: true })
            .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity)
            .map((animation) => animation.finished.catch(() => {})),
        );
      });
      assert.ok(await page.getByRole('combobox', { name: 'Component API' }).isVisible());
      const axe = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      assert.deepEqual(
        axe.violations.map((item) => ({ id: item.id, nodes: item.nodes.map((node) => node.target) })),
        [],
        `${theme}/${family} accessibility`,
      );
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      cases.push({ theme, family, accessibility: 'passed' });
    }
    await navigation.getByRole('button', { name: 'actions', exact: true }).click();
    await page.getByRole('textbox', { name: 'Search components' }).fill('not-a-component');
    assert.equal(await page.getByRole('status').last().textContent(), 'No matching components.');
    await page.getByRole('textbox', { name: 'Search components' }).fill('FloatingPanel');
    assert.match(await page.getByRole('heading', { level: 3 }).textContent(), /FloatingPanel/);
    await page.getByRole('textbox', { name: 'Search components' }).fill('IconButton');
    assert.match(await page.getByRole('heading', { level: 3 }).textContent(), /IconButton/);
    await page.getByRole('button', { name: 'Show native attributes' }).click();
    assert.ok(await page.getByRole('rowheader', { name: 'onClick', exact: true }).isVisible());
    await page.getByRole('button', { name: 'Hide native attributes' }).click();
    await page.getByRole('textbox', { name: 'Search components' }).fill('');
    await navigation.getByRole('button', { name: 'forms', exact: true }).click();
    await page.getByRole('textbox', { name: 'Project name', exact: true }).fill('Retained draft');
    await page.getByRole('combobox', { name: 'Appearance' }).click();
    await page.getByRole('option', { name: theme === 'light' ? 'Dark' : 'Light', exact: true }).click();
    assert.equal(
      await page.getByRole('textbox', { name: 'Project name', exact: true }).inputValue(),
      'Retained draft',
    );
    await navigation.getByRole('button', { name: 'overlays', exact: true }).click();
    await page.getByRole('button', { name: 'Edit project', exact: true }).click();
    await page.getByRole('dialog', { name: 'Edit project' }).waitFor();
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('dialog').count(), 0);
    assert.equal(
      await page
        .getByRole('button', { name: 'Edit project', exact: true })
        .evaluate((element) => element === document.activeElement),
      true,
    );
    await navigation.getByRole('button', { name: 'compat', exact: true }).click();
    assert.equal(
      await page.getByRole('progressbar', { name: 'Release completion' }).getAttribute('aria-valuenow'),
      '68',
    );
    await page.getByRole('button', { name: 'Edit project', exact: true }).click();
    await page.getByRole('dialog', { name: 'Edit project' }).waitFor();
    const modalAxe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    assert.deepEqual(
      modalAxe.violations.map((item) => item.id),
      [],
      'compound dialog accessibility',
    );
    await page.keyboard.press('Escape');
    await page.getByRole('combobox', { name: 'Owner', exact: true }).click();
    await page.getByRole('option', { name: 'Release', exact: true }).click();
    assert.match(await page.getByRole('combobox', { name: 'Owner', exact: true }).textContent(), /Release/);
    assert.equal(
      await page.getByRole('link', { name: 'Client replica', exact: true }).getAttribute('href'),
      '../',
    );
    await fs.mkdir(path.join(root, 'artifacts/reference-validation'), { recursive: true });
    await page.getByRole('combobox', { name: 'Appearance' }).click();
    await page.getByRole('option', { name: theme === 'light' ? 'Light' : 'Dark', exact: true }).click();
    await page.screenshot({ path: path.join(root, `artifacts/reference-validation/catalog-${theme}.png`) });
    await context.close();
  }
  assert.deepEqual(errors, []);
  const report = {
    status: 'passed',
    renderCases: cases.length,
    cases,
    interactions: [
      'API search',
      'theme retains input',
      'dialog focus return',
      'compound dialog accessibility',
      'compound select',
      'Slot anchor',
    ],
    limitations: ['Browser accessibility checks; native Host capabilities are validated separately.'],
  };
  await fs.writeFile(
    path.join(root, 'artifacts/reference-validation/report.json'),
    JSON.stringify(report, null, 2) + '\n',
  );
  console.log(
    JSON.stringify({
      status: report.status,
      renderCases: cases.length,
      interactions: report.interactions.length,
    }),
  );
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
