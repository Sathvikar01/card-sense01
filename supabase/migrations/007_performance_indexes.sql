-- Performance indexes for card browsing, spending queries, and education ranking.

create extension if not exists pg_trgm;

-- credit_cards: fast filtering + sort by popularity
create index if not exists idx_credit_cards_active_popularity
  on public.credit_cards (is_active, popularity_score desc);

create index if not exists idx_credit_cards_active_filters
  on public.credit_cards (is_active, bank_name, card_type, annual_fee);

create index if not exists idx_credit_cards_search_trgm
  on public.credit_cards
  using gin ((coalesce(card_name, '') || ' ' || coalesce(bank_name, '') || ' ' || coalesce(description, '')) gin_trgm_ops);

-- spending_transactions: user timeline queries
create index if not exists idx_spending_transactions_user_date
  on public.spending_transactions (user_id, transaction_date desc);

-- recommendations: dashboard recent recommendations
create index if not exists idx_recommendations_user_created
  on public.recommendations (user_id, created_at desc);

-- education_articles: listing by popularity + category
create index if not exists idx_education_articles_publish_category_views
  on public.education_articles (is_published, category, view_count desc);
