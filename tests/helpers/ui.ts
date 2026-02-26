import { expect, type Locator, type Page } from '@playwright/test'

type RoleName = Parameters<Page['getByRole']>[0]

export async function expectVisible(locator: Locator, name: string): Promise<void> {
  await expect(locator, `Broken selector: expected "${name}" to be visible`).toBeVisible()
}

export async function clickByRole(
  page: Page,
  role: RoleName,
  name: string | RegExp,
  debugName: string
): Promise<void> {
  const locator = page.getByRole(role, { name })
  await expectVisible(locator, debugName)
  await locator.click()
}

export async function fillByPlaceholder(
  page: Page,
  placeholder: string,
  value: string,
  debugName: string
): Promise<void> {
  const locator = page.getByPlaceholder(placeholder, { exact: true })
  await expectVisible(locator, debugName)
  await locator.fill(value)
}
