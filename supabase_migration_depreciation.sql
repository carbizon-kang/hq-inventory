-- =============================================
-- 감가상각 필드 추가 마이그레이션
-- Supabase > SQL Editor 에서 실행하세요.
-- =============================================

ALTER TABLE assets
  ADD COLUMN IF NOT EXISTS purchase_price bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS depreciation_years integer DEFAULT 0;
