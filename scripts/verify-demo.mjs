import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { createDemoServer } from "./serve-demo.mjs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
await mkdir(path.join(root, "docs/demo"), { recursive: true });
await mkdir(path.join(root, "tests/output/demo"), { recursive: true });
const server = createDemoServer();
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const errors = [],
  renders = [],
  checks = [];
let browser;
const settle = (page) => page.waitForTimeout(180);
const screenshot = (page, name) =>
  page.screenshot({ path: path.join(root, "docs/demo", name + ".png") });
try {
  const channel = process.env.UI_BROWSER_CHANNEL || "msedge";
  browser = await chromium.launch({
    headless: true,
    ...(channel === "chromium" ? {} : { channel }),
  });
  const url =
    process.env.DEMO_URL || `http://127.0.0.1:${server.address().port}`;
  for (const theme of ["light", "dark"])
    for (const [width, height, scale] of [
      [1920, 1080, 1],
      [1280, 800, 1],
      [1536, 864, 1.25],
    ]) {
      const context = await browser.newContext({
        viewport: { width, height },
        colorScheme: theme,
        deviceScaleFactor: scale,
      });
      const page = await context.newPage();
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(url);
      await page.getByRole("button", { name: "Switch mode" }).waitFor();
      await settle(page);
      for (const id of [
        "home",
        "chat",
        "settings",
        "appearance",
        "notifications",
        "usage",
        "analytics",
      ]) {
        if (id === "chat")
          await page
            .getByRole("button", {
              name: "Refine desktop navigation",
              exact: true,
            })
            .first()
            .click();
        if (id === "settings") await page.keyboard.press("Control+,");
        if (id === "appearance")
          await page
            .getByRole("button", { name: "Appearance", exact: true })
            .click();
        if (id === "notifications")
          await page
            .getByRole("button", { name: "Notifications", exact: true })
            .click();
        if (id === "usage")
          await page
            .getByRole("button", { name: "Usage & billing", exact: true })
            .click();
        if (id === "analytics")
          await page
            .getByRole("tab", { name: "Analytics", exact: true })
            .click();
        await settle(page);
        const geometry = await page.evaluate(() => ({
          overflow: document.documentElement.scrollWidth > innerWidth,
          rail: document.querySelector(".kit-rail").getBoundingClientRect()
            .width,
          titlebar: document
            .querySelector(".kit-titlebar")
            .getBoundingClientRect().height,
          sidebar: document
            .querySelector(".kit-sidebar")
            .getBoundingClientRect().width,
          settings: document
            .querySelector(".kit-settings-content")
            .getBoundingClientRect().width,
          background: getComputedStyle(
            document.querySelector(".kit-shell__main"),
          ).backgroundColor,
        }));
        assert.equal(geometry.overflow, false);
        assert.equal(geometry.rail, 52);
        assert.equal(geometry.titlebar, 44);
        assert.equal(geometry.sidebar, 372);
        assert.ok(geometry.settings <= 728);
        assert.equal(
          geometry.background,
          theme === "dark" ? "rgb(24, 24, 24)" : "rgb(255, 255, 255)",
        );
        for (const heading of await page
          .locator(
            ".kit-settings-nav h2,.kit-settings-group,.kit-settings-content>h1,.client-settings-group>h2,.client-settings-field h3",
          )
          .all())
          if (await heading.isVisible())
            assert.equal(
              await heading.evaluate((el) => getComputedStyle(el).fontWeight),
              "600",
            );
        for (const value of await page
          .locator(".desktop-select:visible>span:first-child")
          .all()) {
          const rect = await value.boundingBox();
          assert.ok(
            rect.height >= 18,
            "selected values keep descender clearance",
          );
        }
        await page.screenshot({
          path: path.join(
            root,
            width === 1920 || width === 1280
              ? "docs/demo"
              : "tests/output/demo",
            `${id}-${theme}-${width}.png`,
          ),
        });
        renders.push({ page: id, theme, width, height, scale, geometry });
      }
      await context.close();
    }
  const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      colorScheme: "dark",
    }),
    page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(url);
  await page.getByRole("button", { name: "Switch mode" }).waitFor();
  await settle(page);
  assert.equal(
    await page.getByRole("button", { name: "Back", exact: true }).isEnabled(),
    false,
  );
  for (const label of ["File", "Edit", "View"]) {
    await page.getByRole("button", { name: label, exact: true }).click();
    await page.getByRole("menu").waitFor();
    await screenshot(page, `${label.toLowerCase()}-menu`);
    await page.keyboard.press("Escape");
  }
  await page.getByRole("button", { name: "Explore", exact: true }).click();
  await page
    .getByRole("menuitemcheckbox", { name: "Unpin Maps", exact: true })
    .click();
  assert.equal(
    await page.getByRole("button", { name: "Maps", exact: true }).count(),
    0,
  );
  await page
    .getByRole("menuitemcheckbox", { name: "Pin Maps", exact: true })
    .click();
  await screenshot(page, "navigation-menu");
  await page.keyboard.press("Escape");
  assert.equal(
    await page.getByRole("button", { name: "Maps", exact: true }).count(),
    1,
  );
  checks.push("native menu trees and navigation destination pin/unpin");
  await page.getByRole("button", { name: "Open profile menu" }).click();
  await page.getByRole("menuitem", { name: "Help", exact: true }).hover();
  await page
    .getByRole("menuitem", { name: "View source", exact: true })
    .waitFor();
  assert.equal(
    await page
      .getByRole("menuitem", { name: "View source", exact: true })
      .locator("svg")
      .count(),
    1,
  );
  await screenshot(page, "profile-help-menu");
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  checks.push("account and nested Help with GitHub logo");
  await page
    .getByRole("textbox", { name: "Message", exact: true })
    .fill("Draft with descenders: typography and grouping");
  await page
    .getByRole("button", { name: "Toggle sidebar", exact: true })
    .click();
  assert.equal(await page.locator(".kit-sidebar").isVisible(), false);
  assert.equal(
    await page
      .getByRole("textbox", { name: "Message", exact: true })
      .inputValue(),
    "Draft with descenders: typography and grouping",
  );
  await page
    .getByRole("button", { name: "Toggle sidebar", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Refine desktop navigation", exact: true })
    .first()
    .click();
  await page
    .getByRole("textbox", { name: "Message", exact: true })
    .fill("Draft in an existing chat");
  await page.getByRole("button", { name: "Back", exact: true }).click();
  assert.match(
    await page
      .getByRole("textbox", { name: "Message", exact: true })
      .inputValue(),
    /Draft with descenders/,
  );
  await page.getByRole("button", { name: "Forward", exact: true }).click();
  assert.equal(
    await page
      .getByRole("textbox", { name: "Message", exact: true })
      .inputValue(),
    "Draft in an existing chat",
  );
  checks.push("history, mounted sidebar and per-chat draft retention");
  await page.getByRole("button", { name: "Chat actions", exact: true }).click();
  await screenshot(page, "chat-actions");
  await page.getByRole("menuitem", { name: "Pin", exact: true }).click();
  assert.equal(
    await page
      .locator(".client-sidebar-section")
      .filter({
        has: page.getByRole("heading", { name: "Pinned", exact: true }),
      })
      .getByRole("button", { name: "Refine desktop navigation", exact: true })
      .count(),
    1,
  );
  await page.getByRole("button", { name: "Chat actions", exact: true }).click();
  await page.getByRole("menuitem", { name: "Rename", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Chat name" })
    .fill("Review navigation behavior");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  assert.match(
    await page.locator(".client-chat-toolbar").innerText(),
    /Review navigation behavior/,
  );
  checks.push("chat action menu, pin and rename");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  assert.equal(
    await page
      .getByRole("textbox", { name: "Message", exact: true })
      .inputValue(),
    "",
  );
  await page.getByText("Draft in an existing chat", { exact: true }).waitFor();
  checks.push("local message submission");
  await page.keyboard.press("Control+k");
  await page
    .getByRole("textbox", { name: "Search chats", exact: true })
    .fill("Review navigation");
  assert.equal(
    await page
      .locator(".client-search-dialog .client-search-result")
      .filter({ hasText: "Review navigation behavior" })
      .count(),
    1,
  );
  await screenshot(page, "search");
  await page
    .getByRole("button", { name: /Review navigation behavior.*Alt\+1/ })
    .click();
  checks.push("chat search and selection");
  await page
    .getByRole("button", { name: "View activity", exact: true })
    .click();
  assert.ok((await page.locator(".client-chat-row--activity").count()) > 1);
  await screenshot(page, "activity-sidebar");
  await page
    .getByRole("button", { name: "View activity", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Add new project", exact: true })
    .click();
  await screenshot(page, "create-project");
  await page
    .getByRole("button", { name: "Create project", exact: true })
    .click();
  await page.getByRole("alert").waitFor();
  await page
    .getByRole("textbox", { name: "Project name", exact: true })
    .fill("desktop-workspace");
  await page
    .getByRole("button", { name: "Create project", exact: true })
    .click();
  assert.match(await page.getByRole("alert").innerText(), /already exists/);
  await page
    .getByRole("textbox", { name: "Project name", exact: true })
    .fill("release-review");
  await page.keyboard.press("Escape");
  await page.getByRole("dialog", { name: "Discard this project?" }).waitFor();
  await page.getByRole("button", { name: "Keep editing" }).click();
  assert.equal(
    await page
      .getByRole("textbox", { name: "Project name", exact: true })
      .inputValue(),
    "release-review",
  );
  await page
    .getByRole("button", { name: "Create project", exact: true })
    .click();
  await page
    .getByRole("heading", { name: /What should we build in release-review/ })
    .waitFor();
  checks.push(
    "project creation, missing/duplicate validation and unsaved discard guard",
  );
  await page
    .getByRole("complementary")
    .getByRole("button", { name: "release-review", exact: true })
    .hover();
  await page
    .getByRole("button", { name: "Project actions for release-review" })
    .click();
  await screenshot(page, "project-menu");
  await page.getByRole("menuitem", { name: "Edit", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Edit project name" })
    .fill("release-notes");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page
    .getByRole("heading", { name: /What should we build in release-notes/ })
    .waitFor();
  checks.push("project menu and editing");
  await page.keyboard.press("Control+t");
  await page.getByRole("textbox", { name: "Search or enter a URL" }).waitFor();
  await screenshot(page, "new-tab");
  await page.getByRole("button", { name: "Close tab", exact: true }).click();
  checks.push("new-tab panel open/close");
  await page.keyboard.press("Control+,");
  await page.getByRole("switch", { name: "Full access", exact: true }).click();
  const checked = await page
    .getByRole("switch", { name: "Full access", exact: true })
    .getAttribute("aria-checked");
  await page.getByRole("button", { name: "Appearance", exact: true }).click();
  await page.getByRole("button", { name: "Light mode" }).click();
  assert.equal(await page.locator("html").getAttribute("class"), "");
  await page.getByRole("button", { name: "Dark mode" }).click();
  await page.getByRole("button", { name: "Advanced", exact: true }).click();
  await page.getByRole("spinbutton", { name: "UI font size" }).waitFor();
  await screenshot(page, "appearance-advanced");
  await page.getByRole("button", { name: "General", exact: true }).click();
  assert.equal(
    await page
      .getByRole("switch", { name: "Full access", exact: true })
      .getAttribute("aria-checked"),
    checked,
  );
  checks.push(
    "grouped Settings, theme modes, advanced controls and state retention",
  );
  await page
    .getByRole("textbox", { name: "Search", exact: true })
    .fill("nonexistent category");
  await page.getByRole("status").waitFor();
  await page.getByRole("textbox", { name: "Search", exact: true }).fill("");
  checks.push("settings search and empty recovery");
  await page
    .getByRole("button", { name: "Usage & billing", exact: true })
    .click();
  await page.getByRole("tab", { name: "Analytics", exact: true }).click();
  assert.equal(
    await page.getByRole("button", { name: /Inspect day/ }).count(),
    7,
  );
  await page.getByRole("button", { name: "30d", exact: true }).click();
  assert.equal(
    await page.getByRole("button", { name: /Inspect day/ }).count(),
    30,
  );
  await page.getByRole("button", { name: "Previous period" }).click();
  await page.getByRole("button", { name: "Next period" }).click();
  await page.getByRole("combobox", { name: "Usage grouping" }).click();
  await page.getByRole("option", { name: "By model", exact: true }).click();
  await page
    .getByRole("button", { name: "Inspect day 3", exact: true })
    .click();
  await page.getByRole("dialog", { name: "Daily usage" }).waitFor();
  await page.keyboard.press("Escape");
  checks.push("usage periods, grouping, history boundaries and day inspection");
  for (const category of [
    "Import",
    "Account",
    "Archived chats",
    "Parental controls",
    "Trusted contact",
    "Voice",
    "Configuration",
    "Personalization",
    "Mini & Pets",
    "Keyboard shortcuts",
    "Data controls",
    "Plugins",
    "Passwords",
    "Computer use",
    "Appshots",
    "Browser",
    "Cloud computer",
    "Hooks",
    "Connections",
    "Codex Cloud",
    "Legacy Codex Cloud",
  ]) {
    await page
      .locator(".kit-category")
      .filter({
        hasText: new RegExp(
          "^" + category.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$",
        ),
      })
      .click();
    await page
      .getByRole("heading", { level: 1, name: category, exact: true })
      .waitFor();
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      category,
    );
  }
  await page.getByRole("button", { name: "Profile", exact: true }).click();
  await page
    .getByRole("heading", { name: "Alex Taylor", exact: true })
    .waitFor();
  await screenshot(page, "profile");
  await page.getByRole("button", { name: "Weekly", exact: true }).click();
  assert.equal(await page.locator(".client-token-heatmap button").count(), 364);
  checks.push("all settings destinations and standalone profile activity");
  await page.getByRole('button',{name:'Projects',exact:true}).click();
  await page.getByRole('heading',{name:'Projects',exact:true}).waitFor();
  await page.getByRole('textbox',{name:'Search projects',exact:true}).fill('design');
  assert.equal(await page.locator('.client-project-directory-row').count(),1);
  await screenshot(page,'project-directory');
  await page.getByRole('button',{name:'Scheduled',exact:true}).click();
  await page.getByRole('heading',{name:'Schedule a task',exact:true}).waitFor();
  await screenshot(page,'scheduled');
  checks.push('project directory filtering and scheduled landing');
  await context.close();
  const reduced = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    colorScheme: "dark",
    reducedMotion: "reduce",
  });
  const reducedPage = await reduced.newPage();
  await reducedPage.goto(url);
  await reducedPage.getByRole("button", { name: "Switch mode" }).waitFor();
  assert.equal(
    await reducedPage
      .locator(".client-working")
      .first()
      .evaluate((el) => getComputedStyle(el).animationName),
    "none",
  );
  await reduced.close();
  checks.push("reduced-motion preference");
  assert.deepEqual(errors, []);
  const result = {
    status: "passed",
    node: process.version,
    referenceClient: "26.1002.7124.0",
    renderCases: renders.length,
    interactionGroups: checks.length,
    renders,
    checks,
    consoleErrors: errors,
  };
  await writeFile(
    path.join(root, "docs/demo/VALIDATION.json"),
    JSON.stringify(result, null, 2) + "\n",
  );
  console.log(
    JSON.stringify({
      status: result.status,
      renderCases: renders.length,
      interactionGroups: checks.length,
      referenceClient: result.referenceClient,
    }),
  );
} finally {
  await browser?.close();
  await new Promise((r) => server.close(r));
}
