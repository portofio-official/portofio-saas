import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1];
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1];
const supabase = createClient(url, key);

async function backfill() {
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
  if (usersError) {
    console.error("Failed to list users", usersError);
    return;
  }
  
  const { data: profiles, error: profilesError } = await supabase.from('profiles').select('id');
  if (profilesError) {
    console.error("Failed to list profiles", profilesError);
    return;
  }
  
  const profileIds = new Set(profiles.map(p => p.id));
  const missingUsers = users.filter(u => !profileIds.has(u.id));
  
  console.log(`Found ${missingUsers.length} users missing from profiles table.`);
  
  for (const user of missingUsers) {
    const { error } = await supabase.from('profiles').insert({
      id: user.id,
      full_name: user.user_metadata?.full_name || null,
      avatar_url: user.user_metadata?.avatar_url || null,
      role: user.user_metadata?.role || 'user'
    });
    if (error) {
      console.error(`Failed to backfill user ${user.id}`, error);
    } else {
      console.log(`Backfilled user ${user.id}`);
    }
  }
}
backfill();
