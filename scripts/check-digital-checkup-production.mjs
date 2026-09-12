import nextEnv from '@next/env';
import { createClient } from '@supabase/supabase-js';
nextEnv.loadEnvConfig(process.cwd());
const origin = 'https://digitalcheckup.dekatlokal.com';
let failed = false;
function report(label, passed, note = '') {
  console.log(`${passed ? 'OK' : 'PERLU AKTIVASI'}: ${label}${note ? ' — ' + note : ''}`);
  if (!passed) failed = true;
}
report('Domain aplikasi', process.env.NEXT_PUBLIC_APP_URL === origin);
report('Secret scheduler tersedia', (process.env.CRON_SECRET?.length ?? 0) >= 32, 'Tidak memverifikasi apakah jadwal Cron sudah aktif.');
report('Identitas release', Boolean(process.env.DC_BUILD_ID || process.env.VERCEL_GIT_COMMIT_SHA));
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
let validUrl = false;
try { const parsed = new URL(url); validUrl = parsed.protocol === 'https:' && !['localhost', '127.0.0.1', '::1'].includes(parsed.hostname); } catch {}
report('Konfigurasi Supabase produksi', Boolean(validUrl && publicKey && serviceKey));
if (validUrl && publicKey && serviceKey) {
  try {
    const client = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(15000) }) } });
    for (const table of ['dc_instrument_versions', 'dc_decision_model_inputs', 'dc_learning_progress', 'dc_recommendation_jobs']) {
      const { data, error } = await client.from(table).select('*').limit(0);
      report(`Migration: ${table}`, !error && Array.isArray(data));
    }
    const { count, error } = await client.from('dc_decision_model_inputs').select('id', { count: 'exact', head: true });
    report('Model ahli final tersedia', !error && (count ?? 0) > 0, 'Tanpa model, nilai checkup tersedia tetapi ranking personal menunggu.');
    const response = await fetch(url + '/auth/v1/settings', { headers: { apikey: publicKey }, signal: AbortSignal.timeout(15000) });
    const settings = await response.json();
    report('Google provider', response.ok && settings.external?.google === true);
    report('Email provider dan signup', response.ok && settings.external?.email === true && settings.disable_signup === false);
  } catch { report('Koneksi pemeriksaan', false, 'Tidak menampilkan detail koneksi atau secret.'); }
}
console.log('Read-only: tidak membuat akun, mengirim email, atau mengubah data. SMTP, template OTP, callback, Cron, dan alur akun nyata tetap perlu diuji oleh operator.');
process.exitCode = failed ? 1 : 0;
