import { expect, test } from '@playwright/test'

test('smoke: login page loads', async ({ page }) => {
  const response = await page.goto('/login', { waitUntil: 'domcontentloaded' })
  expect(response?.ok()).toBeTruthy()
  await expect(page.locator('body')).toBeVisible()
})
