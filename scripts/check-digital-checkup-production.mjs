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
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
let roster = [];
try {
  const parsed = JSON.parse(process.env.DC_EXPERT_ROSTER || '[{"name":"Ayu Anisela","assignmentId":"723c62f6-af29-43b8-8e9a-32d8923d0f0e"},{"name":"Asluddin","assignmentId":"54938064-c676-46a0-aad3-a43c2f49cb05"},{"name":"Rizky Amelia","assignmentId":"6370bdf5-7e63-45e7-b2b7-c4a6e2f171c3"}]');
  if (Array.isArray(parsed)) roster = parsed;
} catch { /* Report readiness without exposing names, access codes, or raw configuration. */ }
const rosterReady = roster.length === 3 && roster.every(x => x && typeof x.name === 'string' && x.name.trim().length >= 2 && x.name.trim().length <= 150 && uuid.test(x.assignmentId) && (x.accessCode === undefined ? (!process.env.DC_EXPERT_ROSTER?.trim() || process.env.DC_EXPERT_ALLOW_PUBLIC_ENTRY === 'true') : typeof x.accessCode === 'string' && x.accessCode.length >= 12 && x.accessCode.length <= 64)) && new Set(roster.map(x => x.assignmentId)).size === 3 && new Set(roster.map(x => x.name.trim())).size === 3;
report('Tiga ahli tanpa email dikonfigurasi', rosterReady);
const explicitPanel = uuid.test(process.env.DC_AUTO_MODEL_VERSION || '') && uuid.test(process.env.DC_AUTO_MODEL_APPROVER || '');
if (rosterReady && roster.some(x => !x.accessCode)) console.log('PERHATIAN: pilih nama tanpa kode tidak memverifikasi identitas ahli.');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
let validUrl = false;
try { const parsed = new URL(url); validUrl = parsed.protocol === 'https:' && !['localhost', '127.0.0.1', '::1'].includes(parsed.hostname); } catch {}
report('Konfigurasi Supabase produksi', Boolean(validUrl && publicKey && serviceKey));
if (validUrl && publicKey && serviceKey) {
  try {
    const client = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(15000) }) } });
    if (rosterReady) {
      const { data, error } = await client.from('dc_expert_assignments').select('id,status').in('id', roster.map(x => x.assignmentId));
      report('Tiga penugasan ahli tersedia', !error && data?.length === 3, 'Roster produksi cocok dengan tiga penugasan tersimpan.');
      report('Tiga penilaian ahli sudah final', !error && data?.length === 3 && data.every(item => item.status === 'submitted'));
    }
    for (const table of ['dc_instrument_versions', 'dc_decision_model_inputs', 'dc_learning_progress', 'dc_learning_access', 'dc_recommendation_jobs']) {
      const { data, error } = await client.from(table).select('*').limit(0);
      report(`Migration: ${table}`, !error && Array.isArray(data));
    }
    const [{ count: approvers }, { count: modelVersions }] = await Promise.all([
      client.from('dc_profiles').select('user_id', { count: 'exact', head: true }).in('role', ['admin','researcher']),
      client.from('dc_decision_model_versions').select('id', { count: 'exact', head: true }),
    ]);
    report('Panel otomatis siap', explicitPanel || ((approvers ?? 0) > 0 && (modelVersions ?? 0) > 0), 'ID environment opsional; fallback hanya memilih role admin/peneliti dan versi model yang cocok.');
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
