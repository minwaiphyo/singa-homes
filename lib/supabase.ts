import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
// export const supabase = createClient("https://feowsnofuagwjwusfbyq.supabase.co", "sb_secret_DpvgQiiZlSs4WUGPGzYFMw_M415wZtW")

export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
