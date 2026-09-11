import { createClient } from '@supabase/supabase-js';
import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd());
if (process.env.DC_SEED_ENV !== 'development') throw new Error('Set DC_SEED_ENV=development. This script must never target production.');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.env.DC_ADMIN_PASSWORD;
if (!url || !key || !password || password.length < 12) throw new Error('Configure the development Supabase URL, service-role key and DC_ADMIN_PASSWORD in .env.local.');
const email = process.env.DC_ADMIN_EMAIL || 'admin@dekatlokal.com';
const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
let existing;
for (let page = 1; ; page++) {
  const { data, error } = await client.auth.admin.listUsers({ page, perPage: 100 });
  if (error) throw new Error('Cannot read development Auth users. Check configuration.');
  existing = data.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
  if (existing || data.users.length < 100) break;
}
let id = existing?.id;
if (!id) {
  const { data, error } = await client.auth.admin.createUser({ email, password, email_confirm: true });
  if (error || !data.user) throw new Error('Admin creation failed. Check Supabase Auth configuration.');
  id = data.user.id;
}
const { error } = await client.from('dc_profiles').upsert({ user_id: id, role: 'admin', display_name: 'Admin DekatLokal' });
if (error) throw new Error('Admin profile failed. Apply the Digital Checkup migrations first.');
console.log(existing ? 'Development admin profile ready; existing password was not changed.' : 'Development admin created. Credentials are read only from local environment variables.');
