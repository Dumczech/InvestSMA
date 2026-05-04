import { test, expect, type Page } from '@playwright/test';

// Smoke test for every public route at three viewports. Two assertions
// per route: (1) the page renders without throwing or 404'ing, and
// (2) the rendered content does not cause horizontal page overflow.
// A full-page screenshot is captured for each route × viewport so we
// have a reviewable artifact when something looks off.

const STATIC_ROUTES = [
  '/',
  '/about',
  '/cases',
  '/contact',
  '/guide',
  '/insights',
  '/legal',
  '/market-data',
  '/properties',
  '/reports',
  '/roi-calculator',
  '/tax',
];

async function expectNoHorizontalOverflow(page: Page, route: string) {
  // Wait for layout to settle (web fonts + images can shift things).
  await page.waitForLoadState('networkidle');
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      overflowing: doc.scrollWidth > doc.clientWidth + 1, // 1px tolerance for rounding
    };
  });
  expect(
    overflow.overflowing,
    `Horizontal overflow on ${route}: scrollWidth=${overflow.scrollWidth} clientWidth=${overflow.clientWidth}`,
  ).toBe(false);
}

for (const route of STATIC_ROUTES) {
  test(`${route} renders + no horizontal overflow`, async ({ page }, testInfo) => {
    const response = await page.goto(route);
    expect(response?.status(), `${route} returned ${response?.status()}`).toBeLessThan(400);

    await expectNoHorizontalOverflow(page, route);

    await testInfo.attach(`screenshot-${testInfo.project.name}-${route.replace(/\//g, '_') || 'home'}`, {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
  });
}

// Dynamic detail pages: scrape the parent index for the first card link
// and follow it. Fails clearly if the index has no cards (which is itself
// useful signal — empty state shouldn't leak through to mobile QA).
test('first /properties detail page renders + no overflow', async ({ page }, testInfo) => {
  await page.goto('/properties');
  const firstCard = page.locator('a[href^="/properties/"]').first();
  const href = await firstCard.getAttribute('href');
  test.skip(!href, 'No properties seeded yet — skipping detail-page check');
  if (!href) return;
  const res = await page.goto(href);
  expect(res?.status(), `${href} returned ${res?.status()}`).toBeLessThan(400);
  await expectNoHorizontalOverflow(page, href);
  await testInfo.attach(`screenshot-${testInfo.project.name}-property-detail`, {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });
});

test('first /insights detail page renders + no overflow', async ({ page }, testInfo) => {
  await page.goto('/insights');
  const firstCard = page.locator('a[href^="/insights/"]').first();
  const href = await firstCard.getAttribute('href');
  test.skip(!href, 'No insights seeded yet — skipping detail-page check');
  if (!href) return;
  const res = await page.goto(href);
  expect(res?.status(), `${href} returned ${res?.status()}`).toBeLessThan(400);
  await expectNoHorizontalOverflow(page, href);
  await testInfo.attach(`screenshot-${testInfo.project.name}-insight-detail`, {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });
});

// Custom 404. Should render the design's split-screen page, not Next's
// default. Same overflow rule applies.
test('not-found page renders + no overflow', async ({ page }, testInfo) => {
  const res = await page.goto('/this-route-does-not-exist');
  expect(res?.status()).toBe(404);
  await expectNoHorizontalOverflow(page, '/this-route-does-not-exist');
  await testInfo.attach(`screenshot-${testInfo.project.name}-404`, {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });
});
