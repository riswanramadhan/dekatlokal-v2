"use client";

import { useState, type ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import { api } from "@/components/digital-checkup/api";
import type { LayananOverview } from "@/lib/layanan/overview";
import {
  ACCESS_METHODS, BOOKING_HORIZON_DAYS, GBP_PROBLEMS, MANAGER_ACCESS, PAYLOAD_SCHEMAS, TIME_WINDOWS, WEBSITE_PLATFORMS, witaDate,
  type ConsultationPayload, type GbpPayload, type RequestKind, type WebsiteCarePayload,
} from "@/lib/layanan/request-schema";

type Saved = (overview: LayananOverview, updated: boolean) => void;
type Errors = Record<string, string>;

/** Validasi di client hanya untuk umpan balik cepat; server memvalidasi ulang dan mengecek hak akses. */
function useRequestSubmit(kind: RequestKind, onSaved: Saved) {
  const [busy, setBusy] = useState(false), [error, setError] = useState(""), [errors, setErrors] = useState<Errors>({});
  const submit = async (payload: unknown) => {
    setError("");
    const check = PAYLOAD_SCHEMAS[kind].safeParse(payload);
    if (!check.success) {
      const next: Errors = {};
      for (const issue of check.error.issues) { const key = issue.path.join("."); if (!next[key]) next[key] = issue.message; }
      setErrors(next); setError("Periksa lagi bagian yang ditandai.");
      return;
    }
    setErrors({}); setBusy(true);
    try {
      const result = await api<{ overview: LayananOverview; updated: boolean }>("layanan", "POST", { kind, payload: check.data });
      onSaved(result.overview, result.updated);
    } catch (e) { setError(e instanceof Error ? e.message : "Data belum terkirim. Coba lagi."); }
    finally { setBusy(false); }
  };
  return { busy, error, errors, submit };
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return <label className={`dc-field cm-field${error ? " is-invalid" : ""}`}>
    <span className="cm-field-label">{label}</span>
    {children}
    {hint ? <small className="cm-field-hint">{hint}</small> : null}
    {error ? <small className="cm-field-error" role="alert">{error}</small> : null}
  </label>;
}

function FormFooter({ busy, error, label }: { busy: boolean; error: string; label: string }) {
  return <div className="cm-form-footer">
    {error ? <p className="cm-order-error" role="alert">{error}</p> : null}
    <button className="dc-primary" disabled={busy} type="submit">{busy ? "Mengirim…" : label}</button>
  </div>;
}

function SafetyNote({ children }: { children: ReactNode }) {
  return <p className="cm-safety"><ShieldCheck size={16} aria-hidden="true" /><span>{children}</span></p>;
}

const blankSlots = (): ConsultationPayload["slots"] => [0, 1, 2].map(() => ({ date: "", window: "" as ConsultationPayload["slots"][number]["window"] }));

export function ConsultationForm({ initial, whatsapp, onSaved, submitLabel = "Kirim 3 jadwal pilihan" }: { initial?: Partial<ConsultationPayload>; whatsapp: string; onSaved: Saved; submitLabel?: string }) {
  const [slots, setSlots] = useState(initial?.slots?.length === 3 ? initial.slots : blankSlots());
  const [topic, setTopic] = useState(initial?.topic ?? ""), [phone, setPhone] = useState(initial?.whatsapp ?? whatsapp);
  const { busy, error, errors, submit } = useRequestSubmit("consultation", onSaved);
  const min = witaDate(new Date(), 1), max = witaDate(new Date(), BOOKING_HORIZON_DAYS);
  const setSlot = (index: number, patch: Partial<ConsultationPayload["slots"][number]>) => setSlots(slots.map((slot, i) => i === index ? { ...slot, ...patch } : slot));
  return <form className="cm-form" noValidate onSubmit={(event) => { event.preventDefault(); void submit({ slots, topic, whatsapp: phone }); }}>
    <h3>Jadwalkan konsultasi 30 menit</h3>
    <p className="cm-form-intro">Pilih 3 waktu yang paling longgar. Semua jam dalam WITA; admin akan mengonfirmasi satu jadwal lewat WhatsApp.</p>
    <div className="cm-slots">{slots.map((slot, index) => <fieldset key={index} className="cm-slot">
      <legend>Pilihan {index + 1}</legend>
      <Field label="Tanggal" error={errors[`slots.${index}.date`] ?? errors[`slots.${index}`]}>
        <input type="date" min={min} max={max} value={slot.date} onChange={(event) => setSlot(index, { date: event.target.value })} aria-invalid={Boolean(errors[`slots.${index}.date`])} required />
      </Field>
      <Field label="Jam (WITA)" error={errors[`slots.${index}.window`]}>
        <select value={slot.window} onChange={(event) => setSlot(index, { window: event.target.value as ConsultationPayload["slots"][number]["window"] })} aria-invalid={Boolean(errors[`slots.${index}.window`])} required>
          <option value="">Pilih jam</option>
          {TIME_WINDOWS.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
        </select>
      </Field>
    </fieldset>)}</div>
    {errors.slots ? <small className="cm-field-error" role="alert">{errors.slots}</small> : null}
    <Field label="Topik yang ingin dibahas" hint="Misalnya: urutan modul mana dulu, cara mulai jualan online, atau rencana 30 hari." error={errors.topic}>
      <textarea value={topic} maxLength={600} onChange={(event) => setTopic(event.target.value)} aria-invalid={Boolean(errors.topic)} />
    </Field>
    <Field label="Nomor WhatsApp" error={errors.whatsapp}>
      <input inputMode="tel" autoComplete="tel" value={phone} maxLength={20} onChange={(event) => setPhone(event.target.value)} placeholder="081234567890" aria-invalid={Boolean(errors.whatsapp)} />
    </Field>
    <FormFooter busy={busy} error={error} label={submitLabel} />
  </form>;
}

export function GbpForm({ initial, prefill, onSaved }: { initial?: Partial<GbpPayload>; prefill: LayananOverview["prefill"]; onSaved: Saved }) {
  const [value, setValue] = useState<{ mapsUrl: string; managerAccess: string; category: string; openingHours: string; mainProducts: string; problems: GbpPayload["problems"]; problemNote: string; whatsapp: string }>({
    mapsUrl: initial?.mapsUrl ?? prefill.googleMaps,
    managerAccess: initial?.managerAccess ?? "",
    category: initial?.category ?? "",
    openingHours: initial?.openingHours ?? "",
    mainProducts: initial?.mainProducts ?? "",
    problems: initial?.problems ?? [],
    problemNote: initial?.problemNote ?? "",
    whatsapp: initial?.whatsapp ?? prefill.whatsapp,
  });
  const set = <K extends keyof typeof value>(key: K, next: (typeof value)[K]) => setValue({ ...value, [key]: next });
  const { busy, error, errors, submit } = useRequestSubmit("gbp", onSaved);
  const toggle = (problem: GbpPayload["problems"][number]) => set("problems", value.problems.includes(problem) ? value.problems.filter((item) => item !== problem) : [...value.problems, problem]);
  return <form className="cm-form" noValidate onSubmit={(event) => { event.preventDefault(); void submit(value); }}>
    <h3>Data untuk optimasi profil Google</h3>
    <p className="cm-form-intro">Isi sebisanya. Tim kami mengecek profilmu, lalu menghubungi lewat WhatsApp sebelum mengubah apa pun.</p>
    <Field label="Tautan Google Maps usaha" hint="Buka profil usahamu di Google Maps → Bagikan → Salin link. Kosongkan bila usahamu belum muncul." error={errors.mapsUrl}>
      <input type="url" inputMode="url" value={value.mapsUrl} maxLength={500} onChange={(event) => set("mapsUrl", event.target.value)} placeholder="https://maps.app.goo.gl/…" aria-invalid={Boolean(errors.mapsUrl)} />
    </Field>
    <fieldset className="cm-choice" aria-invalid={Boolean(errors.managerAccess)}>
      <legend>Bisakah kamu menambahkan email kami sebagai pengelola (manager) profil?</legend>
      {MANAGER_ACCESS.map(([code, label]) => <label key={code}><input type="radio" name="managerAccess" checked={value.managerAccess === code} onChange={() => set("managerAccess", code)} /> <span>{label}</span></label>)}
      {errors.managerAccess ? <small className="cm-field-error" role="alert">{errors.managerAccess}</small> : null}
    </fieldset>
    <Field label="Kategori usaha di Google" hint={prefill.sector ? `Dari checkup: ${prefill.sector}. Tulis yang paling spesifik, misalnya “Kedai kopi”.` : "Tulis yang paling spesifik, misalnya “Kedai kopi”."} error={errors.category}>
      <input value={value.category} maxLength={120} onChange={(event) => set("category", event.target.value)} aria-invalid={Boolean(errors.category)} />
    </Field>
    <Field label="Jam buka" error={errors.openingHours}>
      <input value={value.openingHours} maxLength={300} onChange={(event) => set("openingHours", event.target.value)} placeholder="Senin–Sabtu 08.00–21.00, Minggu tutup" aria-invalid={Boolean(errors.openingHours)} />
    </Field>
    <Field label="Produk atau layanan utama" error={errors.mainProducts}>
      <textarea value={value.mainProducts} maxLength={1000} onChange={(event) => set("mainProducts", event.target.value)} placeholder="Contoh: kopi susu gula aren Rp18.000, roti bakar Rp15.000" aria-invalid={Boolean(errors.mainProducts)} />
    </Field>
    <fieldset className="cm-choice is-multi" aria-invalid={Boolean(errors.problems)}>
      <legend>Masalah yang ingin dibereskan</legend>
      {GBP_PROBLEMS.map((problem) => <label key={problem}><input type="checkbox" checked={value.problems.includes(problem)} onChange={() => toggle(problem)} /> <span>{problem}</span></label>)}
      {errors.problems ? <small className="cm-field-error" role="alert">{errors.problems}</small> : null}
    </fieldset>
    <Field label="Cerita singkat masalahnya (opsional)" error={errors.problemNote}>
      <textarea value={value.problemNote} maxLength={1000} onChange={(event) => set("problemNote", event.target.value)} aria-invalid={Boolean(errors.problemNote)} />
    </Field>
    <Field label="Nomor WhatsApp" error={errors.whatsapp}>
      <input inputMode="tel" autoComplete="tel" value={value.whatsapp} maxLength={20} onChange={(event) => set("whatsapp", event.target.value)} placeholder="081234567890" aria-invalid={Boolean(errors.whatsapp)} />
    </Field>
    <SafetyNote>Jangan kirim kata sandi akun Google. Kami cukup diundang sebagai pengelola profil, dan aksesnya bisa kamu cabut kapan saja.</SafetyNote>
    <FormFooter busy={busy} error={error} label={initial ? "Simpan perubahan" : "Kirim data GBP"} />
  </form>;
}

export function WebsiteCareForm({ initial, prefill, onSaved }: { initial?: Partial<WebsiteCarePayload>; prefill: LayananOverview["prefill"]; onSaved: Saved }) {
  const [value, setValue] = useState<{ websiteUrl: string; platform: string; accessMethod: string; updates: string; whatsapp: string }>({
    websiteUrl: initial?.websiteUrl ?? "",
    platform: initial?.platform ?? "",
    accessMethod: initial?.accessMethod ?? "",
    updates: initial?.updates ?? "",
    whatsapp: initial?.whatsapp ?? prefill.whatsapp,
  });
  const set = <K extends keyof typeof value>(key: K, next: (typeof value)[K]) => setValue({ ...value, [key]: next });
  const { busy, error, errors, submit } = useRequestSubmit("website_care", onSaved);
  return <form className="cm-form" noValidate onSubmit={(event) => { event.preventDefault(); void submit(value); }}>
    <h3>Permintaan Website Care bulan ini</h3>
    <p className="cm-form-intro">Termasuk hingga 3 kali pembaruan konten per bulan, pemantauan, dan backup. Admin akan mengonfirmasi lewat WhatsApp sebelum mengerjakan.</p>
    <Field label="Alamat website" error={errors.websiteUrl}>
      <input type="url" inputMode="url" value={value.websiteUrl} maxLength={300} onChange={(event) => set("websiteUrl", event.target.value)} placeholder="https://usahaku.com" aria-invalid={Boolean(errors.websiteUrl)} />
    </Field>
    <Field label="Website dibuat dengan" error={errors.platform}>
      <select value={value.platform} onChange={(event) => set("platform", event.target.value)} aria-invalid={Boolean(errors.platform)}>
        <option value="">Pilih platform</option>
        {WEBSITE_PLATFORMS.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
      </select>
    </Field>
    <fieldset className="cm-choice" aria-invalid={Boolean(errors.accessMethod)}>
      <legend>Cara berbagi akses</legend>
      {ACCESS_METHODS.map(([code, label]) => <label key={code}><input type="radio" name="accessMethod" checked={value.accessMethod === code} onChange={() => set("accessMethod", code)} /> <span>{label}</span></label>)}
      {errors.accessMethod ? <small className="cm-field-error" role="alert">{errors.accessMethod}</small> : null}
    </fieldset>
    <SafetyNote>Jangan tulis kata sandi atau kode login di formulir ini. Admin akan memandu cara berbagi akses yang aman lewat WhatsApp, misalnya mengundang email tim kami sebagai editor yang bisa kamu cabut kapan saja.</SafetyNote>
    <Field label="Yang ingin diperbarui bulan ini" hint="Contoh: ganti harga menu, tambah 5 foto produk baru, perbarui jam buka." error={errors.updates}>
      <textarea value={value.updates} maxLength={1500} onChange={(event) => set("updates", event.target.value)} aria-invalid={Boolean(errors.updates)} />
    </Field>
    <Field label="Nomor WhatsApp" error={errors.whatsapp}>
      <input inputMode="tel" autoComplete="tel" value={value.whatsapp} maxLength={20} onChange={(event) => set("whatsapp", event.target.value)} placeholder="081234567890" aria-invalid={Boolean(errors.whatsapp)} />
    </Field>
    <FormFooter busy={busy} error={error} label={initial ? "Simpan perubahan" : "Kirim permintaan"} />
  </form>;
}
