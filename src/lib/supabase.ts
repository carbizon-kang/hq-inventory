import { createClient } from "@supabase/supabase-js";

// 빌드 시 환경변수가 없어도 에러가 나지 않도록 더미값 처리
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
