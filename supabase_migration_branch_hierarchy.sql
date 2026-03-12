-- =============================================
-- 지사 계층구조 컬럼 추가 (부문→본부→팀→사업장)
-- Supabase > SQL Editor 에서 실행하세요.
-- =============================================

alter table branches add column if not exists division    text not null default '';
alter table branches add column if not exists headquarters text not null default '';
alter table branches add column if not exists team        text not null default '';
