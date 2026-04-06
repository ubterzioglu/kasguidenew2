import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
)

async function run() {
  const { data, count, error } = await supabase.from('raw_places').select('id', { count: 'exact' });
  console.log("Raw places returned length:", data?.length);
  console.log("Raw places returned count:", count);
}
run();
