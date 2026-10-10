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
const focusStyle = (element) => {
  const style = getComputedStyle(element);
  return { active: document.activeElement === element, outline: style.outlineStyle, shadow: style.boxShadow };
};
const noPointerRing = async (control) => {
  const style = await control.evaluate(focusStyle);
  assert.equal(style.outline, 'none', 'pointer focus return must not add an outline');
  assert.equal(style.shadow, 'none', 'pointer focus return must not add a ring');
};
const dismissOutside = async (page) => {
  const box = await page.locator('.reference-heading h2').boundingBox();
  assert.ok(box);
  // Modal Radix portals disable the background's pointer events. A physical click
  // still dismisses the overlay; locator.click would wait for the blocked heading.
  await page.mouse.click(box.x + 8, box.y + 8);
};
try {
  await fs.mkdir(path.join(root, 'artifacts/reference-validation'), { recursive: true });
  for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      colorScheme: theme,
      permissions: ['clipboard-read', 'clipboard-write'],
    });
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    const navigation = page.getByRole('navigation', { name: 'Component families' });
    for (const family of Object.keys(families)) {
      await navigation.getByRole('button', { name: family, exact: true }).click();
      await page.locator('.reference-heading h2').waitFor();
      // Contrast measurements must use the settled surface, not its entrance fade.
      await page.locator('.reference-preview').evaluate(async (element) => {
        await Promise.all(
          element
            .getAnimations({ subtree: true })
            .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity)
            .map((animation) => animation.finished.catch(() => {})),
        );
      });
      assert.equal(
        await navigation.getByRole('button', { name: family, exact: true }).getAttribute('aria-current'),
        'page',
      );
      const axe = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      assert.deepEqual(
        axe.violations.map((item) => ({ id: item.id, nodes: item.nodes.map((node) => node.target) })),
        [],
        `${theme}/${family} accessibility`,
      );
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await page.screenshot({
        path: path.join(root, 'artifacts/reference-validation/' + family + '-' + theme + '-1280.png'),
      });
      cases.push({ theme, family, accessibility: 'passed' });
    }
    await navigation.getByRole('button', { name: 'actions', exact: true }).click();
    await page.getByRole('textbox', { name: 'Search components' }).fill('not-a-component');
    assert.equal(await page.getByText('No matching components.', { exact: true }).count(), 1);
    await page.getByRole('textbox', { name: 'Search components' }).fill('FloatingPanel');
    await navigation.getByRole('button', { name: 'FloatingPanel', exact: true }).click();
    assert.equal(await page.locator('.reference-heading h2').textContent(), 'FloatingPanel');
    await page.getByRole('textbox', { name: 'Search components' }).fill('IconButton');
    await navigation.getByRole('button', { name: 'IconButton', exact: true }).click();
    assert.equal(await page.locator('.reference-heading h2').textContent(), 'IconButton');
    await page.getByRole('button', { name: 'Copy import', exact: true }).click();
    assert.equal(
      (await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, '\n'),
      await page.locator('.reference-import pre').textContent(),
    );
    assert.equal(await page.getByText('Import copied to clipboard.', { exact: true }).count(), 1);
    await page.evaluate(() => {
      navigator.clipboard.writeText = async () => {
        throw new DOMException('Denied', 'NotAllowedError');
      };
    });
    await page.getByRole('button', { name: 'Copy import', exact: true }).click();
    await page.getByRole('alert').waitFor();
    assert.equal(await page.getByText('Import copied to clipboard.', { exact: true }).count(), 0);
    assert.match(await page.getByRole('alert').textContent(), /Select the code/);
    await page.evaluate(() => {
      delete navigator.clipboard.writeText;
    });
    await page.getByRole('button', { name: 'Native attributes', exact: true }).click();
    assert.ok(await page.getByRole('rowheader', { name: 'onClick', exact: true }).isVisible());
    await page.getByRole('button', { name: 'Native attributes', exact: true }).click();
    await page.getByRole('textbox', { name: 'Search components' }).fill('');
    await navigation.getByRole('button', { name: 'forms', exact: true }).click();
    await page.getByRole('textbox', { name: 'Project name', exact: true }).fill('Retained draft');
    await page.getByRole('combobox', { name: 'Appearance' }).click();
    await page.getByRole('option', { name: theme === 'light' ? 'Dark' : 'Light', exact: true }).click();
    const appearance = page.getByRole('combobox', { name: 'Appearance' });
    await noPointerRing(appearance);
    await appearance.click();
    await dismissOutside(page);
    await noPointerRing(appearance);
    // First Tab originates outside the React tree. Keyboard modality must still be restored.
    await page.evaluate(() => {
      document.body.tabIndex = -1;
      document.body.focus();
    });
    for (let index = 0; index < 14; index++) {
      await page.keyboard.press('Tab');
      if (await appearance.evaluate((element) => element === document.activeElement)) break;
    }
    await page.evaluate(() => document.body.removeAttribute('tabindex'));
    assert.equal((await appearance.evaluate(focusStyle)).active, true);
    assert.notEqual((await appearance.evaluate(focusStyle)).shadow, 'none', 'keyboard focus remains visible');
    await page.keyboard.press('ArrowDown');
    await page.getByRole('listbox').waitFor();
    await page.waitForFunction(() => document.activeElement?.getAttribute('role') === 'option');
    await page.keyboard.press('Home');
    await page.keyboard.press('Enter');
    await page.waitForFunction(
      () => document.querySelector('[aria-label="Appearance"]') === document.activeElement,
    );
    assert.notEqual(
      (await appearance.evaluate(focusStyle)).shadow,
      'none',
      'keyboard selection returns visible focus',
    );
    assert.equal(
      await page.getByRole('textbox', { name: 'Project name', exact: true }).inputValue(),
      'Retained draft',
    );
    await navigation.getByRole('button', { name: 'Input', exact: true }).click();
    assert.equal(
      await page.getByRole('textbox', { name: 'Project name', exact: true }).inputValue(),
      'Retained draft',
    );
    await page.getByRole('button', { name: 'Reset example', exact: true }).click();
    assert.equal(
      await page.getByRole('textbox', { name: 'Project name', exact: true }).inputValue(),
      'Release notes',
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
    const checkboxGeometry = await page
      .getByRole('checkbox', { name: 'Include completed', exact: true })
      .evaluate((element) => ({
        padding: getComputedStyle(element).padding,
        iconWidth: element.querySelector('svg').getBoundingClientRect().width,
      }));
    assert.equal(checkboxGeometry.padding, '0px', 'compound controls use the same host reset');
    assert.equal(checkboxGeometry.iconWidth, 14, 'checkbox glyph is not compressed by native button padding');
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
    await noPointerRing(page.getByRole('combobox', { name: 'Owner', exact: true }));
    const menu = page.getByRole('button', { name: 'Actions', exact: true });
    await menu.click();
    await dismissOutside(page);
    await noPointerRing(menu);
    const details = page.getByRole('button', { name: 'Details', exact: true });
    await details.click();
    await dismissOutside(page);
    await noPointerRing(details);
    assert.match(await page.getByRole('combobox', { name: 'Owner', exact: true }).textContent(), /Release/);
    assert.equal(
      await page.getByRole('link', { name: 'Client replica', exact: true }).getAttribute('href'),
      '../',
    );
    await page.getByRole('combobox', { name: 'Appearance' }).click();
    await page.getByRole('option', { name: theme === 'light' ? 'Light' : 'Dark', exact: true }).click();
    await page.screenshot({ path: path.join(root, `artifacts/reference-validation/catalog-${theme}.png`) });
    await context.close();
    for (const viewport of [
      { width: 1920, height: 1080, scale: 1 },
      { width: 1536, height: 864, scale: 1.25 },
    ]) {
      const scaled = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: viewport.scale,
        colorScheme: theme,
      });
      const scaledPage = await scaled.newPage();
      await scaledPage.goto(`http://127.0.0.1:${server.address().port}`);
      for (const family of ['actions', 'forms', 'compat']) {
        await scaledPage
          .getByRole('navigation', { name: 'Component families' })
          .getByRole('button', { name: family, exact: true })
          .click();
        assert.equal(
          await scaledPage.evaluate(() => document.documentElement.scrollWidth > innerWidth),
          false,
        );
        await scaledPage
          .locator('.reference-preview-frame, .reference-sidebar')
          .evaluateAll(async (elements) => {
            await Promise.all(
              elements
                .flatMap((element) => element.getAnimations({ subtree: true }))
                .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity)
                .map((animation) => animation.finished.catch(() => {})),
            );
          });
        await scaledPage.screenshot({
          path: path.join(
            root,
            'artifacts/reference-validation/' +
              family +
              '-' +
              theme +
              '-' +
              viewport.width +
              '-scale' +
              viewport.scale +
              '.png',
          ),
        });
      }
      await scaled.close();
    }
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
      'clipboard content, feedback and permission failure recovery',
      'pointer selection and outside dismissal without rings',
      'keyboard focus including first Tab and focus return',
      'API selection retains preview state',
      'explicit preview reset',
      '1920 and 125% emulated layouts',
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
