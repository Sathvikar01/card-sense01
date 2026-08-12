import { defineConfig } from '@playwright/test'

const e2eBypassKey = process.env.CARDSENSE_E2E_BYPASS_KEY || 'cardsense-playwright-bypass'

export default defineConfig({
  testDir: './tests',
  timeout: 120_000,
  expect: {
    timeout: 15_000,
  },
  retries: process.env.CI ? 1 : 0,
  webServer: {
    command: 'npm run start',
    url: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      ...process.env,
      CARDSENSE_E2E_BYPASS_KEY: e2eBypassKey,
    },
  },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'retain-on-failure',
    navigationTimeout: 60_000,
    actionTimeout: 15_000,
    extraHTTPHeaders: {
      'x-cardsense-e2e': e2eBypassKey,
    },
  },
  reporter: process.env.CI ? [['github'], ['list']] : [['list']],
})
