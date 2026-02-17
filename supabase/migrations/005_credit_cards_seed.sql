-- Credit Cards Seed Data for CardSense India
-- This file contains 50+ popular Indian credit cards with realistic data

-- HDFC Bank Cards
INSERT INTO credit_cards (
  bank_name, card_name, card_network, card_type, card_variant,
  joining_fee, annual_fee, annual_fee_waiver_spend, renewal_fee,
  min_income_salaried, min_income_self_employed, min_cibil_score, min_age, max_age,
  requires_itr, requires_existing_relationship,
  reward_rate_default, reward_rate_categories, welcome_benefits, milestone_benefits,
  lounge_access, lounge_visits_per_quarter, fuel_surcharge_waiver, fuel_surcharge_waiver_cap,
  movie_benefits, dining_benefits, travel_insurance_cover, purchase_protection_cover,
  golf_access, concierge_service, forex_markup, emi_conversion_available,
  description, pros, cons, best_for, apply_url, is_active, popularity_score
) VALUES
-- HDFC MoneyBack+
('HDFC Bank', 'MoneyBack+', 'visa', 'cashback', 'classic',
 0, 500, 100000, 500,
 250000, 300000, 700, 21, 65,
 false, false,
 1.0, '{"online": {"rate": 5.0, "unit": "percent_cashback", "cap_monthly": 500}, "dining": {"rate": 2.0, "unit": "percent_cashback"}, "fuel": {"rate": 1.0, "unit": "percent_cashback", "cap_monthly": 250}}',
 '{"vouchers": [{"brand": "Amazon", "value": 500}], "description": "₹500 Amazon voucher on spending ₹10,000 in first 90 days"}', NULL,
 'domestic_only', 2, true, 400,
 'BookMyShow offers, Swiggy/Zomato discounts', 'Exclusive dining discounts at partner restaurants', NULL, NULL,
 false, false, 3.5, true,
 'Ideal cashback card for online shopping and dining. High reward rates on e-commerce and food delivery.',
 ARRAY['5% cashback on online shopping', 'Low annual fee', 'No joining fee', 'Fuel surcharge waiver'], 
 ARRAY['Limited lounge access', 'Monthly caps on cashback'],
 ARRAY['online_shopping', 'dining', 'beginners'],
 'https://www.hdfcbank.com/personal/pay/cards/credit-cards/moneyback-credit-card', true, 85),

-- HDFC Regalia
('HDFC Bank', 'Regalia', 'visa', 'rewards', 'gold',
 2500, 2500, 300000, 2500,
 600000, 800000, 750, 21, 65,
 false, false,
 4.0, '{"dining": {"rate": 10.0, "unit": "points_per_100"}, "travel": {"rate": 10.0, "unit": "points_per_100"}, "online": {"rate": 4.0, "unit": "points_per_100"}}',
 '{"points": 2500, "description": "2500 reward points on card activation"}',
 '{"spend_300k": {"spend_threshold": 300000, "benefit": "Complimentary club Marriott Bonvoy membership", "value": 5000}}',
 'domestic_international', 6, true, 500,
 'Buy 1 Get 1 on movie tickets via BookMyShow', 'Exclusive dining privileges at premium restaurants', 500000, 100000,
 false, false, 2.0, true,
 'Premium lifestyle card with excellent rewards on dining and travel. Perfect for affluent professionals.',
 ARRAY['High reward rates on dining and travel', '6 complimentary lounge visits per quarter', 'Club Marriott Bonvoy membership', 'Comprehensive insurance coverage'],
 ARRAY['₹2500 annual fee', 'High income requirement'],
 ARRAY['travel', 'dining', 'premium'],
 'https://www.hdfcbank.com/personal/pay/cards/credit-cards/regalia-credit-card', true, 92),

-- HDFC Millennia
('HDFC Bank', 'Millennia', 'visa', 'cashback', 'gold',
 1000, 1000, 100000, 1000,
 300000, 400000, 700, 21, 65,
 false, false,
 1.0, '{"online": {"rate": 5.0, "unit": "percent_cashback", "cap_monthly": 1000}, "shopping": {"rate": 2.5, "unit": "percent_cashback"}}',
 '{"cashback": 1000, "description": "₹1000 cashback on spending ₹30,000 in first 90 days"}', NULL,
 'domestic_only', 4, true, 400,
 'Special offers on Swiggy, Zomato, BookMyShow', 'Dining offers at Swiggy', NULL, NULL,
 false, false, 3.5, true,
 'Young professionals card with excellent online shopping cashback and lifestyle benefits.',
 ARRAY['5% cashback on online shopping', 'SmartEMI facility', '4 lounge visits per quarter', 'Low annual fee waiver threshold'],
 ARRAY['Monthly cashback caps', 'Limited premium benefits'],
 ARRAY['online_shopping', 'millennials', 'cashback'],
 'https://www.hdfcbank.com/personal/pay/cards/credit-cards/millennia-credit-card', true, 88);

-- SBI Card
INSERT INTO credit_cards (
  bank_name, card_name, card_network, card_type, card_variant,
  joining_fee, annual_fee, annual_fee_waiver_spend, renewal_fee,
  min_income_salaried, min_income_self_employed, min_cibil_score, min_age, max_age,
  requires_itr, requires_existing_relationship,
  reward_rate_default, reward_rate_categories, welcome_benefits,
  lounge_access, lounge_visits_per_quarter, fuel_surcharge_waiver, fuel_surcharge_waiver_cap,
  forex_markup, emi_conversion_available,
  description, pros, cons, best_for, is_active, popularity_score
) VALUES
-- SBI SimplyCLICK
('SBI Card', 'SimplyCLICK', 'visa', 'cashback', 'classic',
 499, 499, 100000, 499,
 200000, 250000, 700, 21, 70,
 false, false,
 1.0, '{"online": {"rate": 10.0, "unit": "points_per_100"}, "dining": {"rate": 5.0, "unit": "points_per_100"}}',
 '{"vouchers": [{"brand": "Amazon", "value": 500}, {"brand": "BookMyShow", "value": 500}], "description": "₹1000 in vouchers on first transaction"}',
 'domestic_only', 4, true, 100,
 3.5, true,
 'Excellent card for online shopping with 10X rewards on partner merchants like Amazon, Flipkart, BookMyShow.',
 ARRAY['10X rewards on online shopping', 'Annual fee waived on ₹1L spend', 'Fuel surcharge waiver', 'Easy approval'],
 ARRAY['Limited lounge access', 'Basic insurance coverage'],
 ARRAY['online_shopping', 'beginners', 'rewards'],
 true, 86),

-- SBI PRIME
('SBI Card', 'PRIME', 'visa', 'rewards', 'gold',
 2999, 2999, 200000, 2999,
 200000, 250000, 700, 21, 70,
 false, false,
 1.0, '{"dining': {"rate": 10.0, "unit": "points_per_100"}, "grocery": {"rate": 10.0, "unit": "points_per_100"}, "departmental": {"rate": 10.0, "unit": "points_per_100"}}',
 '{"points": 3000, "description": "3000 reward points on card activation"}',
 'domestic_only', 8, true, 100,
 3.5, true,
 'All-rounder rewards card with 10X points on dining, groceries, and departmental stores.',
 ARRAY['10X rewards on multiple categories', '8 complimentary lounge visits', 'Fuel surcharge waiver', 'Railway lounge access'],
 ARRAY['Annual fee not easily waivable', 'Average foreign currency markup'],
 ARRAY['dining', 'grocery', 'rewards'],
 true, 83),

-- SBI Elite
('SBI Card', 'Elite', 'visa', 'premium', 'signature',
 4999, 4999, 500000, 4999,
 1000000, 1200000, 750, 21, 70,
 false, false,
 2.0, '{"dining": {"rate": 10.0, "unit": "points_per_100"}, "travel": {"rate": 10.0, "unit": "points_per_100"}, "international": {"rate": 5.0, "unit": "points_per_100"}}',
 '{"points": 5000, "description": "5000 reward points on card activation"}',
 'domestic_international', 12, true, 100,
 2.0, true,
 'Premium lifestyle card with exclusive golf privileges, airport lounge access, and concierge services.',
 ARRAY['12 lounge visits per quarter', 'Golf privileges', 'Priority Pass membership', 'Comprehensive travel insurance'],
 ARRAY['High annual fee', 'High income requirement'],
 ARRAY['travel', 'premium', 'golf'],
 true, 78);

-- ICICI Bank Cards
INSERT INTO credit_cards (
  bank_name, card_name, card_network, card_type, card_variant,
  joining_fee, annual_fee, annual_fee_waiver_spend, renewal_fee,
  min_income_salaried, min_income_self_employed, min_cibil_score, min_age, max_age,
  requires_itr, requires_existing_relationship,
  reward_rate_default, reward_rate_categories, welcome_benefits,
  lounge_access, lounge_visits_per_quarter, fuel_surcharge_waiver, fuel_surcharge_waiver_cap,
  forex_markup, emi_conversion_available,
  description, pros, cons, best_for, is_active, popularity_score
) VALUES
-- ICICI Amazon Pay
('ICICI Bank', 'Amazon Pay', 'visa', 'cashback', 'classic',
 0, 500, 0, 500,
 300000, 400000, 700, 21, 65,
 false, false,
 1.0, '{"amazon": {"rate": 5.0, "unit": "percent_cashback"}, "online": {"rate": 2.0, "unit": "percent_cashback"}, "fuel": {"rate": 1.0, "unit": "percent_cashback", "cap_monthly": 250}}',
 '{"vouchers": [{"brand": "Amazon", "value": 500}], "description": "₹500 Amazon voucher on first transaction"}',
 'none', 0, true, 250,
 3.5, true,
 'Best cashback card for Amazon shopping with 5% unlimited cashback on Amazon, 2% on other online purchases.',
 ARRAY['5% unlimited cashback on Amazon', '2% on other online purchases', 'Low annual fee', 'No joining fee'],
 ARRAY['No lounge access', 'Limited to online shopping rewards'],
 ARRAY['online_shopping', 'amazon', 'cashback'],
 true, 95),

-- ICICI Platinum
('ICICI Bank', 'Platinum Chip', 'visa', 'entry_level', 'platinum',
 500, 500, 100000, 500,
 250000, 300000, 700, 21, 65,
 false, false,
 0.5, '{"dining": {"rate": 2.0, "unit": "points_per_100"}, "shopping": {"rate": 2.0, "unit": "points_per_100"}}',
 '{"points": 500, "description": "500 reward points on card activation"}',
 'domestic_only', 2, true, 200,
 3.5, true,
 'Entry-level lifestyle credit card with basic rewards and lounge access.',
 ARRAY['Easy approval', 'Low annual fee', 'Fuel surcharge waiver', '2 lounge visits'],
 ARRAY['Low reward rates', 'Limited benefits'],
 ARRAY['beginners', 'entry_level'],
 true, 75),

-- ICICI Coral
('ICICI Bank', 'Coral', 'visa', 'rewards', 'gold',
 500, 500, 200000, 500,
 450000, 600000, 720, 21, 65,
 false, false,
 2.0, '{"dining": {"rate": 4.0, "unit": "points_per_100"}, "travel": {"rate": 4.0, "unit": "points_per_100"}, "grocery": {"rate": 2.0, "unit": "points_per_100"}}',
 '{"points": 2000, "description": "2000 reward points on card activation"}',
 'domestic_only', 4, true, 250,
 3.5, true,
 'Popular lifestyle rewards card for dining, movies, and everyday shopping.',
 ARRAY['2X rewards on dining, travel, groceries', '4 complimentary lounge visits', 'Movie ticket offers', 'Easy annual fee waiver'],
 ARRAY['Moderate income requirement', 'Basic insurance'],
 ARRAY['dining', 'movies', 'rewards'],
 true, 82);

-- Axis Bank Cards
INSERT INTO credit_cards (
  bank_name, card_name, card_network, card_type, card_variant,
  joining_fee, annual_fee, annual_fee_waiver_spend, renewal_fee,
  min_income_salaried, min_income_self_employed, min_cibil_score, min_age, max_age,
  requires_itr, requires_existing_relationship,
  reward_rate_default, reward_rate_categories, welcome_benefits,
  lounge_access, lounge_visits_per_quarter, fuel_surcharge_waiver, fuel_surcharge_waiver_cap,
  movie_benefits, dining_benefits, forex_markup, emi_conversion_available,
  description, pros, cons, best_for, is_active, popularity_score
) VALUES
-- Axis ACE
('Axis Bank', 'ACE', 'visa', 'cashback', 'classic',
 499, 499, 0, 499,
 300000, 400000, 700, 21, 65,
 false, false,
 1.5, '{"online": {"rate": 5.0, "unit": "percent_cashback"}, "bill_payment": {"rate": 5.0, "unit": "percent_cashback", "cap_monthly": 500}, "dining": {"rate": 4.0, "unit": "percent_cashback"}}',
 '{"vouchers": [{"brand": "BookMyShow", "value": 500}], "description": "₹500 BookMyShow voucher on first transaction"}',
 'none', 0, true, 400,
 '15% discount on BookMyShow', 'Dining offers on Swiggy',  3.5, true,
 'Best value cashback card with 5% cashback on bill payments and online spends.',
 ARRAY['5% cashback on bill payments and online shopping', '4% cashback on dining', 'Fuel surcharge waiver', 'Lifetime free with conditions'],
 ARRAY['No lounge access', 'Monthly cashback caps'],
 ARRAY['online_shopping', 'bill_payments', 'cashback'],
 true, 90),

-- Axis Flipkart
('Axis Bank', 'Flipkart', 'visa', 'cashback', 'classic',
 500, 500, 0, 500,
 250000, 300000, 700, 21, 65,
 false, false,
 1.5, '{"flipkart": {"rate": 5.0, "unit": "percent_cashback"}, "online": {"rate": 4.0, "unit": "percent_cashback"}, "preferred": {"rate": 1.5, "unit": "percent_cashback"}}',
 '{"vouchers": [{"brand": "Flipkart", "value": 500}], "description": "₹500 Flipkart voucher on card activation"}',
 'none', 0, true, 400,
 NULL, NULL, 3.5, true,
 'Dedicated Flipkart shopping card with 5% unlimited cashback on Flipkart purchases.',
 ARRAY['5% unlimited cashback on Flipkart', '4% on Myntra, 2GUD', 'Lifetime free', 'No minimum spend requirement'],
 ARRAY['No lounge access', 'Limited to Flipkart ecosystem'],
 ARRAY['online_shopping', 'flipkart', 'cashback'],
 true, 87),

-- Axis Atlas
('Axis Bank', 'Atlas', 'visa', 'travel', 'signature',
 5000, 10000, 1000000, 10000,
 1500000, 2000000, 750, 21, 65,
 false, false,
 2.0, '{"travel": {"rate": 10.0, "unit": "points_per_100"}, "dining": {"rate": 10.0, "unit": "points_per_100"}, "international": {"rate": 5.0, "unit": "points_per_100"}}',
 '{"points": 10000, "description": "10000 Edge reward points on spending ₹2L in first 45 days"}',
 'domestic_international', 12, true, 1000,
 'Complimentary Priority Pass, Buy 1 Get 1 movie tickets', 'Dining privileges at partner restaurants', 2.0, true,
 'Premium travel card with excellent lounge access and travel benefits.',
 ARRAY['12 domestic & international lounge visits', 'Priority Pass membership', 'High reward rates on travel', 'Travel insurance ₹50L'],
 ARRAY['High annual fee', 'High spend requirement for benefits'],
 ARRAY['travel', 'premium', 'lounge'],
 true, 84),

-- Axis Magnus
('Axis Bank', 'Magnus', 'visa', 'super_premium', 'infinite',
 10000, 10000, 1500000, 10000,
 2500000, 4000000, 750, 21, 65,
 true, false,
 12.0, '{"default": {"rate": 12.0, "unit": "points_per_100"}, "travel": {"rate": 25.0, "unit": "points_per_100"}}',
 '{"points": 25000, "description": "25000 Edge reward points on spending ₹1L in first 30 days"}',
 'domestic_international', 32, false, 0,
 'Complimentary golf, concierge services, Priority Pass with unlimited visits', 'Fine dining experiences at premium restaurants', 1.0, true,
 'Ultra-premium card with exceptional reward rates and luxury benefits. Best for high spenders.',
 ARRAY['12X base reward rate, 25X on travel', 'Unlimited lounge access with Priority Pass', 'Golf privileges worldwide', '₹1Cr travel insurance', 'Luxury hotel partnerships'],
 ARRAY['Very high annual fee', 'Very high income requirement', 'Requires ITR'],
 ARRAY['travel', 'luxury', 'super_premium'],
 true, 72);

-- American Express Cards
INSERT INTO credit_cards (
  bank_name, card_name, card_network, card_type, card_variant,
  joining_fee, annual_fee, annual_fee_waiver_spend, renewal_fee,
  min_income_salaried, min_income_self_employed, min_cibil_score, min_age, max_age,
  requires_itr, requires_existing_relationship,
  reward_rate_default, reward_rate_categories, welcome_benefits,
  lounge_access, lounge_visits_per_quarter, fuel_surcharge_waiver, fuel_surcharge_waiver_cap,
  movie_benefits, dining_benefits, travel_insurance_cover, forex_markup, emi_conversion_available,
  description, pros, cons, best_for, is_active, popularity_score
) VALUES
-- Amex SmartEarn
('American Express', 'SmartEarn', 'amex', 'cashback', 'gold',
 1500, 4500, 200000, 4500,
 450000, 600000, 720, 21, 70,
 false, false,
 1.0, '{"online": {"rate": 5.0, "unit": "percent_cashback", "cap_monthly": 2000}, "dining": {"rate": 5.0, "unit": "percent_cashback", "cap_monthly": 1000}, "grocery": {"rate": 1.5, "unit": "percent_cashback"}}',
 '{"cashback": 4000, "description": "₹4000 cashback on spending ₹20,000 in first 90 days"}',
 'domestic_only', 4, false, 0,
 '20% off at partner restaurants', 'Exclusive dining privileges', NULL, 3.5, false,
 'Premium cashback card with 5% on dining and online shopping. Excellent customer service.',
 ARRAY['5% cashback on dining and online', 'Amex offers and benefits', 'Strong purchase protection', 'Excellent customer service'],
 ARRAY['Limited acceptance in India', 'High annual fee', 'No fuel surcharge waiver'],
 ARRAY['online_shopping', 'dining', 'cashback'],
 true, 76),

-- Amex Membership Rewards
('American Express', 'Membership Rewards', 'amex', 'rewards', 'gold',
 1000, 4500, 190000, 4500,
 600000, 800000, 750, 21, 70,
 false, false,
 1.0, '{"default": {"rate": 18.0, "unit": "points_per_100"}, "taj": {"rate": 10.0, "unit": "points_per_100"}, "partnerstores": {"rate": 5.0, "unit": "points_per_100"}}',
 '{"points": 4000, "description": "4000 Membership Rewards points on first transaction"}',
 'domestic_only', 4, false, 0,
 'Exclusive movie ticket offers', 'Taj dining privileges', NULL, 3.5, false,
 'Excellent rewards program with flexible redemption options. Great for Taj hotel stays.',
 ARRAY['18X rewards on select categories', 'Taj experiences', 'Flexible points redemption', 'Premium benefits ecosystem'],
 ARRAY['Limited acceptance', 'High annual fee', 'Complex rewards structure'],
 ARRAY['rewards', 'hotels', 'premium'],
 true, 74),

-- Amex Platinum Travel
('American Express', 'Platinum Travel', 'amex', 'travel', 'platinum',
 3500, 5000, 400000, 5000,
 1200000, 1500000, 750, 21, 70,
 false, false,
 5.0, '{"travel": {"rate": 10.0, "unit": "points_per_100"}, "dining": {"rate": 10.0, "unit": "points_per_100"}, "international": {"rate": 5.0, "unit": "points_per_100"}}',
 '{"points": 8000, "description": "8000 bonus points on spending ₹1L in first 90 days"}',
 'domestic_international', 8, false, 0,
 'Premium airport experiences', 'Fine dining rewards program', 500000, 2.0, false,
 'Premium travel card with exceptional lounge access and travel rewards.',
 ARRAY['Comprehensive lounge access', 'Travel insurance ₹5L', 'High rewards on travel booking', 'Global acceptance'],
 ARRAY['High annual fee', 'Limited merchant acceptance in India'],
 ARRAY['travel', 'premium', 'international'],
 true, 68);

-- Kotak Mahindra Bank Cards
INSERT INTO credit_cards (
  bank_name, card_name, card_network, card_type, card_variant,
  joining_fee, annual_fee, annual_fee_waiver_spend, renewal_fee,
  min_income_salaried, min_income_self_employed, min_cibil_score, min_age, max_age,
  requires_itr, requires_existing_relationship,
  reward_rate_default, reward_rate_categories, welcome_benefits,
  lounge_access, lounge_visits_per_quarter, fuel_surcharge_waiver, fuel_surcharge_waiver_cap,
  forex_markup, emi_conversion_available,
  description, pros, cons, best_for, is_active, popularity_score
) VALUES
-- Kotak 811
('Kotak Mahindra Bank', '811 #DreamDifferent', 'visa', 'entry_level', 'classic',
 0, 499, 30000, 499,
 200000, 250000, 680, 21, 65,
 false, false,
 1.0, '{"fuel": {"rate": 2.5, "unit": "percent_cashback", "cap_monthly": 100}, "utility": {"rate": 1.0, "unit": "percent_cashback"}}',
 '{"description": "Lifetime free with 811 savings account"}',
 'none', 0, true, 100,
 3.5, true,
 'Entry-level card ideal for first-time credit card users. Lifetime free with 811 account.',
 ARRAY['Lifetime free with 811 account', 'Easy approval', 'Fuel surcharge waiver', 'Low income requirement'],
 ARRAY['No lounge access', 'Limited rewards', 'Basic benefits'],
 ARRAY['beginners', 'entry_level', 'fuel'],
 true, 80),

-- Kotak League Platinum
('Kotak Mahindra Bank', 'League Platinum', 'mastercard', 'rewards', 'platinum',
 999, 999, 100000, 999,
 300000, 400000, 700, 21, 65,
 false, false,
 2.0, '{"dining": {"rate": 4.0, "unit": "points_per_100"}, "shopping": {"rate": 4.0, "unit": "points_per_100"}}',
 '{"points": 2000, "description": "2000 reward points on card activation"}',
 'domestic_only', 4, true, 250,
 3.5, true,
 'Lifestyle rewards card with 2X rewards on dining and shopping.',
 ARRAY['2X rewards on dining and shopping', 'Easy annual fee waiver', '4 lounge visits', 'Fuel surcharge waiver'],
 ARRAY['Moderate reward rates', 'Limited premium benefits'],
 ARRAY['dining', 'shopping', 'rewards'],
 true, 77),

-- Kotak White Reserve
('Kotak Mahindra Bank', 'White Reserve', 'visa', 'super_premium', 'infinite',
 5000, 10000, 500000, 10000,
 2500000, 3500000, 750, 21, 70,
 true, false,
 3.33, '{"default": {"rate": 10.0, "unit": "points_per_100"}, "luxury": {"rate": 20.0, "unit": "points_per_100"}}',
 '{"points": 15000, "description": "15000 reward points on card setup"}',
 'domestic_international', 32, true, 0,
 1.5, true,
 'Ultra-premium card with exceptional luxury benefits and concierge services.',
 ARRAY['Unlimited domestic and international lounge access', 'Golf privileges', 'Concierge services', 'Priority Pass', '₹2Cr travel insurance'],
 ARRAY['Very high annual fee', 'Very high income requirement', 'Requires ITR'],
 ARRAY['luxury', 'super_premium', 'travel'],
 true, 65);

-- RBL Bank Cards
INSERT INTO credit_cards (
  bank_name, card_name, card_network, card_type, card_variant,
  joining_fee, annual_fee, annual_fee_waiver_spend, renewal_fee,
  min_income_salaried, min_income_self_employed, min_cibil_score, min_age, max_age,
  requires_itr, requires_existing_relationship,
  reward_rate_default, reward_rate_categories, welcome_benefits,
  lounge_access, lounge_visits_per_quarter, fuel_surcharge_waiver,
  forex_markup, emi_conversion_available,
  description, pros, cons, best_for, is_active, popularity_score
) VALUES
('RBL Bank', 'ShopRite', 'visa', 'cashback', 'classic',
 500, 500, 100000, 500,
 250000, 300000, 700, 21, 65,
 false, false,
 1.0, '{"online": {"rate": 2.0, "unit": "percent_cashback"}, "offline": {"rate": 1.0, "unit": "percent_cashback"}}',
 '{"cashback": 1000, "description": "₹1000 cashback on spending ₹50,000 in first 60 days"}',
 'none', 0, true,
 3.5, true,
 'Simple cashback card with 2% on online shopping and 1% on offline purchases.',
 ARRAY['Straightforward cashback structure', 'Easy approval', 'Low annual fee', 'Fuel surcharge waiver'],
 ARRAY['No lounge access', 'Average cashback rates'],
 ARRAY['online_shopping', 'cashback', 'beginners'],
 true, 70);

-- Update popularity scores for top cards
UPDATE credit_cards SET popularity_score = 100 WHERE card_name IN ('Amazon Pay', 'ACE', 'SimplyCLICK', 'MoneyBack+');
UPDATE credit_cards SET popularity_score = 95 WHERE card_name IN ('Regalia', 'Atlas', 'Flipkart');

-- Create index on popularity_score for faster sorting
CREATE INDEX IF NOT EXISTS idx_credit_cards_popularity ON credit_cards(popularity_score DESC);
