import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
)

async function run() {
  const { data, error } = await supabase.from('raw_places').select('id').limit(276);
  console.log("Raw places returned:", data?.length);
  if (error) console.error(error);
}

run();
