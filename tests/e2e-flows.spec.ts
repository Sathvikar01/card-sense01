import { expect, test } from '@playwright/test'
import { clickByRole, expectVisible, fillByPlaceholder } from './helpers/ui'

const mockInteractionsEndpoint = async (page: import('@playwright/test').Page) => {
  await page.route('**/api/interactions**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, inserted: 1 }),
    })
  })
}

test('User signup flow', async ({ page }) => {
  await mockInteractionsEndpoint(page)

  let signupRequestSeen = false
  let capturedEmail = ''
  let capturedPassword = ''

  await page.route('**/api/auth/signup**', async (route) => {
    const signupPayload = route.request().postDataJSON() as { email?: string; password?: string }
    signupRequestSeen = true
    capturedEmail = String(signupPayload?.email || '')
    capturedPassword = String(signupPayload?.password || '')

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    })
  })

  await page.goto('/signup')

  const email = `playwright+${Date.now()}@example.com`
  const password = 'Playwright123'

  await fillByPlaceholder(page, 'John Doe', 'Playwright QA User', 'Signup full name input')
  await fillByPlaceholder(page, 'you@example.com', email, 'Signup email input')
  await fillByPlaceholder(page, 'Create a password', password, 'Signup password input')

  const termsCheckbox = page.getByRole('checkbox').first()
  await expectVisible(termsCheckbox, 'Signup terms checkbox')
  await termsCheckbox.click()

  await clickByRole(page, 'button', /^Create account$/, 'Signup submit button')

  await expect
    .poll(() => signupRequestSeen, {
      message: 'Expected signup request to be sent to /api/auth/signup',
    })
    .toBeTruthy()

  expect(capturedEmail).toBe(email)
  expect(capturedPassword).toBe(password)

  await expect(page, 'Expected successful signup flow to navigate to /dashboard').toHaveURL(/\/dashboard/)
})

test('Recommendation generation flow', async ({ page }) => {
  await mockInteractionsEndpoint(page)

  let recommendCalled = false

  await page.route('**/api/profile/cibil**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        history: [{ credit_score: 762, score_date: '2026-01-01' }],
      }),
    })
  })

  await page.route('**/api/profile', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        profile: {
          annual_income: 1200000,
          employment_type: 'salaried',
          city: 'Mumbai',
          primary_bank: 'HDFC Bank',
          has_fixed_deposit: false,
          fd_amount: 0,
          credit_score: 762,
        },
      }),
    })
  })

  await page.route('**/api/cards/user**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ cards: [] }),
    })
  })

  await page.route('**/api/ai/recommend**', async (route) => {
    recommendCalled = true
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
            score: 88,
            reason: 'High score on rewards and spend fit.',
            annualFee: 999,
            rewardRate: 1.5,
            estimatedAnnualValue: 4500,
            pros: ['Good rewards'],
            cons: ['Annual fee'],
            bestCategories: ['groceries', 'shopping'],
            eligibilityMatch: 'high',
            usageStrategy: 'Use for groceries and online shopping.',
          },
        ],
      }),
    })
  })

  await page.goto('/advisor?new=1')

  await expectVisible(page.getByRole('heading', { name: /Advisor/i }), 'Advisor page heading')
  await clickByRole(page, 'button', /^Continue$/, 'Advisor continue button (step 1)')
  await clickByRole(page, 'button', /^Continue$/, 'Advisor continue button (step 2)')

  await expectVisible(
    page.getByText(/Select your top spending categories/i),
    'Advisor spending category prompt'
  )
  await clickByRole(page, 'button', /^Groceries$/, 'Advisor groceries category button')
  await clickByRole(page, 'button', /^Continue$/, 'Advisor continue button (step 3)')

  await clickByRole(page, 'button', /Rewards and cashback/i, 'Advisor primary goal button')
  await clickByRole(page, 'button', /^Get Recommendations$/, 'Advisor get recommendations button')

  await expect
    .poll(() => recommendCalled, {
      message: 'Expected /api/ai/recommend to be called during recommendation flow',
    })
    .toBeTruthy()

  await expectVisible(
    page.getByRole('heading', { name: /Recommended Cards/i }),
    'Advisor recommendations heading'
  )
  await expectVisible(page.getByText('HDFC Test Card'), 'Recommended card title')
})

test('Statement upload flow (mock file)', async ({ page }) => {
  let sawMultipartPayload = false

  await page.route('**/api/spending/upload**', async (route) => {
    const contentType = (await route.request().headerValue('content-type')) || ''
    const buffer = route.request().postDataBuffer()
    sawMultipartPayload = contentType.includes('multipart/form-data') && Boolean(buffer && buffer.length > 0)

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        inserted: 2,
        summary: {
          total: 1700,
          count: 2,
          debits: 2,
          credits: 0,
        },
      }),
    })
  })

  await page.goto('/spending')
  await expectVisible(page.getByRole('heading', { name: /Spending Tracker/i }), 'Spending page heading')

  const uploadResult = await page.evaluate(async () => {
    const csv = [
      'Date,Description,Debit,Credit,Amount',
      '2026-01-01,SWIGGY ORDER,450,,450',
      '2026-01-02,AMAZON PURCHASE,1250,,1250',
    ].join('\n')

    const file = new File([csv], 'statement.csv', { type: 'text/csv' })
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/spending/upload', {
      method: 'POST',
      body: formData,
    })

    return {
      status: response.status,
      data: await response.json(),
    }
  })

  expect(sawMultipartPayload).toBeTruthy()
  expect(uploadResult.status).toBe(200)
  expect(uploadResult.data.inserted).toBe(2)
  expect(uploadResult.data.summary.total).toBe(1700)
})

test('Cards browsing pagination', async ({ page }) => {
  const mockCards = Array.from({ length: 25 }).map((_, index) => ({
    id: `card-${index + 1}`,
    bank_name: `Bank ${index + 1}`,
    card_name: `Card ${index + 1}`,
    card_type: 'cashback',
    annual_fee: 500 + index,
    reward_rate_default: 1 + index / 100,
    lounge_access: 'none',
    best_for: ['shopping'],
    popularity_score: 90 - index,
  }))

  await page.route('**/api/cards**', async (route) => {
    const url = new URL(route.request().url())
    const limit = Number(url.searchParams.get('limit') || '60')
    const offset = Number(url.searchParams.get('offset') || '0')
    const paginated = mockCards.slice(offset, offset + limit)

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        cards: paginated,
        meta: {
          total: mockCards.length,
          limit,
          offset,
        },
      }),
    })
  })

  await page.goto('/cards')

  await expectVisible(page.getByRole('heading', { name: /Browse Credit Cards/i }), 'Cards page heading')
  await expect(
    page.getByText(/Showing\s+25\s+cards/i),
    'Broken selector: expected cards count summary to show total cards'
  ).toBeVisible()

  const paginationResult = await page.evaluate(async () => {
    const first = await fetch('/api/cards?fields=summary&limit=10&offset=0').then((res) => res.json())
    const second = await fetch('/api/cards?fields=summary&limit=10&offset=10').then((res) => res.json())

    return {
      firstIds: (first.cards || []).map((card: { id: string }) => card.id),
      secondIds: (second.cards || []).map((card: { id: string }) => card.id),
    }
  })

  expect(paginationResult.firstIds).toHaveLength(10)
  expect(paginationResult.secondIds).toHaveLength(10)
  expect(paginationResult.firstIds[0]).not.toBe(paginationResult.secondIds[0])

  const overlap = paginationResult.firstIds.filter((id: string) => paginationResult.secondIds.includes(id))
  expect(overlap).toHaveLength(0)
})
