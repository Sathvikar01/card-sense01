import { expect, test } from '@playwright/test'
import { answerAdvisor, expectVisible } from './helpers/ui'

test('Advisor recommendations respond to primary goal', async ({ page }) => {
  let recommendCalled = false
  let capturedPayload: Record<string, unknown> | null = null

  await page.route('**/api/interactions**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
  })

  await page.route('**/api/profile/cibil**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ history: [{ credit_score: 760, score_date: '2026-02-01' }] }),
    })
  })

  await page.route('**/api/profile', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        profile: {
          annual_income: 900000,
          employment_type: 'salaried',
          city: 'Delhi',
          primary_bank: 'HDFC Bank',
          has_fixed_deposit: false,
          fd_amount: 0,
          credit_score: 760,
        },
      }),
    })
  })

  await page.route('**/api/cards/user**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ cards: [] }) })
  })

  await page.route('**/api/ai/recommend**', async (route) => {
    recommendCalled = true
    capturedPayload = route.request().postDataJSON() as Record<string, unknown>
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        analysis: 'Top recommendation generated for your spending profile.',
        cards: [
          {
            id: 'card-001',
            name: 'HDFC Test Card',
            bank: 'HDFC Bank',
            score: 90,
            reason: 'Aligned to your primary goal and spending.',
            annualFee: 999,
            rewardRate: 1.5,
            estimatedAnnualValue: 4500,
            pros: ['Goal aligned'],
            cons: ['Annual fee'],
            bestCategories: ['travel', 'dining'],
            eligibilityMatch: 'high',
            usageStrategy: 'Use for travel and dining.',
          },
        ],
      }),
    })
  })

  await page.goto('/advisor?new=1')

  await expectVisible(page.getByRole('heading', { name: /Advisor/i }), 'Advisor page heading')
  await answerAdvisor(
    page,
    [/^25–30$/, /^Above ₹6L a year$/, /^No$/, /^Travel & commute$/, /^Travel and lounges$/],
    '40000'
  )

  await expect
    .poll(() => recommendCalled, {
      message: 'Expected /api/ai/recommend to be called during recommendation flow',
    })
    .toBeTruthy()

  expect((capturedPayload?.['followUpAnswers'] as Record<string, string> | undefined)?.value_priority).toBe('travel_perks')

  await expectVisible(
    page.getByRole('heading', { name: /Your matches/i }),
    'Advisor recommendations heading'
  )
})

test('Advisor results layout is responsive', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 })
  await page.goto('/advisor?new=1')

  await expectVisible(page.getByRole('heading', { name: /Advisor/i }), 'Advisor page heading')
})
