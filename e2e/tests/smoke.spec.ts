import { test, expect } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/dashboard/i);
});

test("healthz responds", async ({ request }) => {
  const res = await request.get("/api/healthz");
  expect(res.ok()).toBeTruthy();
});