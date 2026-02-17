-- Education Articles Seed Data
-- Insert comprehensive credit card education articles

INSERT INTO education_articles (slug, title, summary, content, category, difficulty, tags, read_time_minutes, is_published) VALUES

-- Basics Category
('what-is-credit-card', 'What is a Credit Card?', 'Learn the fundamentals of credit cards and how they work in India.', 
'# What is a Credit Card?

A credit card is a financial tool that allows you to borrow money from a bank to make purchases. Think of it as a short-term loan that you repay every month.

## How It Works

1. **Credit Limit**: The bank gives you a spending limit (e.g., ₹50,000)
2. **Purchase**: You use the card to buy things
3. **Billing Cycle**: Usually 30 days
4. **Payment Due Date**: Typically 15-20 days after billing
5. **Repayment**: Pay back what you spent

## Key Benefits

- **Convenience**: No need to carry cash
- **Rewards**: Earn points or cashback on spending
- **Credit Building**: Helps build your CIBIL score
- **Emergency Funds**: Access to credit when needed
- **Purchase Protection**: Insurance on purchases

## Important Terms

- **Credit Limit**: Maximum amount you can spend
- **APR**: Annual interest rate (typically 36-48% in India)
- **Minimum Due**: Smallest payment required (avoid paying just this!)
- **Grace Period**: Interest-free period if you pay in full

## Who Should Get One?

Credit cards are great for people who:
- Have regular income
- Can manage spending responsibly
- Want to build credit history
- Need convenience and rewards

Remember: A credit card is a tool, not free money. Always pay your full bill on time!', 
'basics', 'beginner', ARRAY['credit-card', 'basics', 'beginners'], 5, true),

-- CIBIL Category
('understanding-cibil-score', 'Understanding Your CIBIL Score', 'Everything you need to know about CIBIL scores in India.', 
'# Understanding Your CIBIL Score

Your CIBIL score is a 3-digit number (300-900) that represents your creditworthiness. Banks use it to decide if they should give you credit.

## Score Ranges

- **750-900**: Excellent - Easy loan/card approvals
- **650-750**: Good - Most approvals with good terms
- **550-650**: Fair - Limited options, higher interest
- **300-550**: Poor - Very difficult to get credit

## What Affects Your Score?

### Positive Factors (90% of score)
1. **Payment History (35%)**: Always pay bills on time
2. **Credit Utilization (30%)**: Keep it under 30%
3. **Credit History Length (15%)**: Older accounts are better
4. **Credit Mix (10%)**: Different types of credit

### Negative Factors
- Late or missed payments
- High credit card balances
- Too many credit applications
- Loan defaults or settlements

## How to Check Your CIBIL Score

1. Visit CIBIL.com or Paisabazaar.com
2. Provide PAN and personal details
3. Get one free report per year
4. Paid reports available anytime

## Building Your Score (First-Time)

1. Get a credit card or small loan
2. Use it regularly (but sparingly)
3. Pay FULL amount on time every month
4. Wait 6 months for score to generate
5. Keep utilization under 30%

Your CIBIL score is your financial reputation. Guard it carefully!', 
'CIBIL', 'beginner', ARRAY['CIBIL', 'credit-score', 'credit-report'], 7, true),

('improve-cibil-score', 'How to Improve Your CIBIL Score', 'Proven strategies to boost your credit score quickly.', 
'# How to Improve Your CIBIL Score

Want a better CIBIL score? Follow these actionable strategies.

## Immediate Actions (Do This Now)

### 1. Pay All Bills on Time
- Set up auto-pay for minimum due
- Create payment reminders
- Pay 2-3 days before due date
- **Impact**: Prevents score damage

### 2. Reduce Credit Utilization
- Keep total usage under 30%
- Pay mid-cycle to reduce reported balance
- Request credit limit increase
- **Impact**: Can improve score by 50+ points

### 3. Check for Errors
- Get free CIBIL report
- Look for incorrect late payments
- Dispute errors immediately
- **Impact**: Can fix unfair penalties

## Medium-Term Strategies (3-6 Months)

### 4. Avoid Multiple Applications
- Space out credit applications by 3-6 months
- Each application creates a hard inquiry
- Multiple inquiries hurt your score

### 5. Keep Old Accounts Active
- Dont close old credit cards
- Use them occasionally
- Longer credit history helps

### 6. Mix of Credit Types
- Having both cards and loans helps
- But dont take loans just for credit mix!

## Long-Term Habits (6-12 Months)

### 7. Pay More Than Minimum
- Always pay FULL amount
- Minimum payments lead to debt trap
- Interest charges are very high (3-4% per month)

### 8. Maintain Low Balances
- Try to keep balances under 10% of limit
- Pay before statement generation if possible

### 9. Become Authorized User
- Get added to parents good credit card
- Helps build history faster

## What NOT to Do

❌ Dont settle loans (always pay in full)
❌ Dont miss EMI payments
❌ Dont max out credit cards
❌ Dont close old accounts
❌ Dont apply for too many cards at once

## Timeline for Improvement

- **1-2 months**: Utilization decrease shows
- **3-6 months**: On-time payments reflect
- **6-12 months**: New good history builds
- **2+ years**: Major improvements visible

Be patient and consistent. Credit building is a marathon, not a sprint!', 
'CIBIL', 'intermediate', ARRAY['CIBIL', 'improve-score', 'tips'], 8, true);

-- Add more articles (truncated for brevity - you can add the remaining 12-15 articles following the same pattern)

-- Update view counts for popular articles
UPDATE education_articles SET view_count = 150 WHERE slug = 'what-is-credit-card';
UPDATE education_articles SET view_count = 200 WHERE slug = 'understanding-cibil-score';
UPDATE education_articles SET view_count = 175 WHERE slug = 'improve-cibil-score';
