"use client";
import { motion, useReducedMotion } from "motion/react";
import { Globe, ShoppingBag, Store, UserRound, Phone, Target } from "lucide-react";
import type { BusinessProfile } from "@/lib/digital-checkup/validation";
import { businessSectors } from "@/lib/digital-checkup/contact";
import { RegionPicker } from "@/components/digital-checkup/region-picker";
import { WhatsAppIcon, InstagramFacebookIcon } from "@/components/digital-checkup/social-icons";
import { fadeUp, stagger } from "@/components/system/motion";

export const channels = ["Toko / lapak", "WhatsApp", "Instagram / Facebook", "Marketplace", "Website", "Lainnya"] as const;
const channelIcons = [Store, WhatsAppIcon, InstagramFacebookIcon, ShoppingBag, Globe, ShoppingBag];

export const profileStages = [
  { key: "usaha", title: "Ceritakan sedikit usahamu.", lead: "Kenalan singkat dulu. Setelah ini, kita cek kondisi usahamu bareng.", icon: Store, fields: ["businessName", "sector", "provinceCode", "cityCode", "businessAgeMonths", "peopleCount", "respondentRole"] },
  { key: "kontak", title: "Biar hasilnya bisa kami kirim.", lead: "Kontak dipakai untuk menyimpan hasil dan menghubungi kamu bila perlu. Tidak dibagikan ke pihak lain.", icon: Phone, fields: ["email", "whatsapp", "instagram", "tiktok", "googleMaps"] },
  { key: "target", title: "Jualan lewat mana, dan mau beresin apa?", lead: "Jawaban ini membantu kami memilih modul yang paling dekat dengan kebutuhanmu.", icon: Target, fields: ["salesChannels", "goal", "note"] },
] as const;

type Props = { stage: number; profile: BusinessProfile; onEdit: (key: keyof BusinessProfile, value: BusinessProfile[keyof BusinessProfile]) => void; onRegion: (provinceCode: string, cityCode: string, district: string) => void; headingRef: React.RefObject<HTMLHeadingElement | null> };

export function ProfileForm({ stage, profile, onEdit, onRegion, headingRef }: Props) {
  const reduced = useReducedMotion();
  const current = profileStages[stage];
  const Icon = current.icon;
  const num = (value: number) => (Number.isNaN(value) ? "" : value);
  return (
    <motion.section key={current.key} className="ck-card" initial={reduced ? false : "hidden"} animate="show" variants={stagger(0.05)}>
      <motion.div variants={fadeUp} className="ck-stage-head"><span className="ck-hero-icon" style={{ width: 48, height: 48, marginBottom: 0, borderRadius: 14 }}><Icon size={22} /></span><span className="chip chip-primary">Profil usaha · {stage + 1} dari 3</span></motion.div>
      <motion.h1 variants={fadeUp} ref={headingRef} tabIndex={-1}>{current.title}</motion.h1>
      <motion.p variants={fadeUp} className="ck-lead">{current.lead}</motion.p>

      {stage === 0 && (
        <motion.div variants={fadeUp}>
          <label className="ck-field" data-field="businessName">Nama bisnis<input aria-label="Nama bisnis" required autoComplete="organization" value={profile.businessName ?? ""} maxLength={150} placeholder="Nama yang dikenal pelanggan" onChange={(e) => onEdit("businessName", e.target.value)} /></label>
          <label className="ck-field" data-field="sector">Jenis usaha<select aria-label="Jenis usaha" required value={profile.sector} onChange={(e) => onEdit("sector", e.target.value)}><option value="">Pilih bidang usahamu</option>{profile.sector && !businessSectors.includes(profile.sector) && <option>{profile.sector}</option>}{businessSectors.map((x) => <option key={x}>{x}</option>)}</select></label>
          <RegionPicker provinceCode={profile.provinceCode ?? ""} cityCode={profile.cityCode ?? ""} onChange={onRegion} />
          <div className="ck-grid-2">
            <label className="ck-field" data-field="businessAgeMonths">Lama usaha (bulan)<input aria-label="Lama usaha (bulan)" required type="number" inputMode="numeric" min={0} max={2400} placeholder="Contoh: 12" value={num(profile.businessAgeMonths)} onChange={(e) => onEdit("businessAgeMonths", e.target.value === "" ? NaN : Number(e.target.value))} /><small>Baru mulai? Isi 0.</small></label>
            <label className="ck-field" data-field="peopleCount">Jumlah orang, termasuk pemilik<input aria-label="Jumlah orang, termasuk pemilik" required type="number" inputMode="numeric" min={1} max={100000} placeholder="Contoh: 1" value={num(profile.peopleCount)} onChange={(e) => onEdit("peopleCount", e.target.value === "" ? NaN : Number(e.target.value))} /></label>
          </div>
          <div className="ck-field">Peran kamu<div className="ck-segments" role="radiogroup" aria-label="Peran kamu">{(["Pemilik", "Pengelola"] as const).map((role) => <label key={role} className={profile.respondentRole === role ? "is-selected" : ""}><input type="radio" name="respondentRole" value={role} checked={profile.respondentRole === role} onChange={() => onEdit("respondentRole", role)} /><UserRound size={15} style={{ display: "inline", verticalAlign: "-2px", marginRight: 6 }} />{role}</label>)}</div></div>
        </motion.div>
      )}

      {stage === 1 && (
        <motion.div variants={fadeUp}>
          <label className="ck-field" data-field="email">Email<input aria-label="Email" required type="email" inputMode="email" autoComplete="email" value={profile.email ?? ""} maxLength={254} placeholder="nama@email.com" onChange={(e) => onEdit("email", e.target.value)} /><small>Dipakai untuk masuk dan membuka modul gratis setelah checkup.</small></label>
          <label className="ck-field" data-field="whatsapp">Nomor WhatsApp<input aria-label="Nomor WhatsApp" required type="tel" autoComplete="tel" value={profile.whatsapp ?? ""} maxLength={25} placeholder="08xxxxxxxxxx" onChange={(e) => onEdit("whatsapp", e.target.value)} /></label>
          <p className="ck-muted" style={{ marginTop: 20 }}><strong>Usahamu ada di mana saja?</strong> Isi yang sudah kamu punya. Belum ada? Lewati saja, tidak mengurangi nilai.</p>
          {([["instagram", "Instagram", "@namabisnis"], ["tiktok", "TikTok", "@namabisnis"], ["googleMaps", "Link Google Maps", "https://maps.app.goo.gl/…"]] as const).map(([key, label, placeholder]) => (
            <label className="ck-field" data-field={key} key={key}>{label} <small>(opsional)</small><input type={key === "googleMaps" ? "url" : "text"} aria-label={label} autoCapitalize="none" autoCorrect="off" maxLength={key === "googleMaps" ? 500 : 100} value={profile[key] ?? ""} placeholder={placeholder} onChange={(e) => onEdit(key, e.target.value)} /></label>
          ))}
        </motion.div>
      )}

      {stage === 2 && (
        <motion.div variants={fadeUp}>
          <fieldset data-field="salesChannels" style={{ border: 0, padding: 0, margin: "16px 0", minWidth: 0 }} className="ck-field">
            <legend style={{ padding: 0, marginBottom: 10 }}>Biasanya jualan lewat mana? <small>Boleh pilih lebih dari satu.</small></legend>
            <div className="ck-chips">
              {channels.map((c, i) => { const Icon = channelIcons[i]; const on = profile.salesChannels.includes(c); return (
                <label className={`ck-chip${on ? " is-selected" : ""}`} key={c}><input type="checkbox" checked={on} onChange={(e) => onEdit("salesChannels", e.target.checked ? [...profile.salesChannels, c] : profile.salesChannels.filter((x) => x !== c))} /><Icon size={20} strokeWidth={1.7} aria-hidden="true" /><span>{c}</span></label>
              ); })}
            </div>
          </fieldset>
          <label className="ck-field" data-field="goal">Apa yang ingin kamu bereskan dalam 30 hari?<textarea aria-label="Apa yang ingin kamu bereskan dalam 30 hari?" required maxLength={500} rows={3} value={profile.goal} placeholder="Contoh: mulai rutin mencatat uang masuk dan keluar" onChange={(e) => onEdit("goal", e.target.value)} /></label>
          <label className="ck-field">Ada cerita lain soal usahamu? <small>(opsional)</small><textarea maxLength={1000} rows={3} value={profile.note} onChange={(e) => onEdit("note", e.target.value)} placeholder="Misalnya, usaha baru mulai dua minggu lalu. Hindari data pribadi sensitif." /></label>
        </motion.div>
      )}
    </motion.section>
  );
}
