"use client";

import { adminWhatsApp } from "@/lib/digital-checkup/contact";
import { useId, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, Info } from "lucide-react";
import { SectionHeading } from "@/components/landing/section-heading";

const pricingPlans = [
  {
    name: "Mulai",
    price: "Rp0",
    originalPrice: null,
    saving: null,
    description: "Mulai dari kondisi usaha dan tuntaskan tiga fokus paling penting.",
    features: [
      "Cek delapan bagian penting usahamu",
      "Tiga modul dasar sesuai kebutuhanmu",
      "Kuis dan tugas praktik usaha",
      "Simpan hasil praktik dan perkembangan belajar",
    ],
    cta: "Mulai Gratis",
    hrefType: "checkup",
    status: "Mulai tanpa biaya",
    statusDetail: "Cek usahamu dulu. Pilih langkah berikutnya setelah melihat hasilnya.",
    featured: false,
  },
  {
    name: "Tumbuh",
    price: "Rp499.000",
    originalPrice: "Rp1.000.000",
    saving: "Hemat Rp501.000",
    description: "Lanjut belajar dan bangun tampilan online usahamu.",
    features: [
      "Semua manfaat paket Mulai",
      "Empat modul lanjutan",
      "Website pengenalan usaha satu halaman",
      "Pengelolaan media sosial dasar selama 30 hari",
      "Bantu daftarkan usaha di Google dan buat katalog produk",
      "Monitoring usaha one-on-one bersama pendamping",
      "Rencana kerja 90 hari, lembar latihan, dan contoh siap pakai",
    ],
    cta: "Aktifkan Paket",
    hrefType: "premium",
    status: "Segera tersedia",
    statusDetail: "Produksi website dan layanan media sosial sedang dipersiapkan.",
    featured: true,
  },
  {
    name: "Melesat",
    price: "Rp799.000",
    originalPrice: "Rp1.500.000",
    saving: "Hemat Rp701.000",
    description: "Dapatkan masukan untuk promosi, website, dan rencana usahamu.",
    features: [
      "Semua manfaat paket Tumbuh",
      "Website pengenalan usaha dengan tampilan sesuai kebutuhan",
      "Kelola media sosial 30 hari, termasuk 12 konten dan teks postingan",
      "Rapikan profil usaha di Google dan katalog produk",
      "Usaha pasti tampil di Google melalui Google Business Profile",
      "Belajar Meta Ads dan dasar beriklan",
      "Dua sesi diskusi usaha bersama",
      "Masukan untuk tiga hasil praktik usahamu",
      "Ringkasan hasil dan rencana kerja 30 hari untuk usahamu",
    ],
    cta: "Pilih Pendampingan",
    hrefType: "interest",
    status: "Segera tersedia",
    statusDetail: "Pendaftaran pendampingan dan pembayaran belum dibuka.",
    featured: false,
  },
] as const;

function resolveHref(type: (typeof pricingPlans)[number]["hrefType"], checkupHref: string) {
  if (type === "checkup") return checkupHref;
  if (type === "premium") return adminWhatsApp("Halo Admin DekatLokal, saya ingin bertanya tentang Paket Tumbuh.");
  return adminWhatsApp("Halo Admin DekatLokal, saya tertarik dengan Paket Melesat.");
}

export function LandingPricingSelector({ checkupHref }: { checkupHref: string }) {
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const detailId = useId();
  const reduceMotion = useReducedMotion();
  const selectedPlan = pricingPlans[selectedPlanIndex];
  const isFree = selectedPlan.hrefType === "checkup";
  const href = resolveHref(selectedPlan.hrefType, checkupHref);
  const isExternal = href.startsWith("http");

  const cta = (
    <>
      <span>{isFree ? "Mulai Gratis" : "Tanya Paket Ini"}</span>
      <ArrowRight aria-hidden="true" size={18} />
    </>
  );

  return (
    <>
      <div className="dl-pricing">
        <div className="dl-pricing-choice">
          <SectionHeading
            description="Bereskan fondasinya dulu. Kalau butuh pendampingan lebih jauh, pilih paket yang benar-benar cocok dengan tujuanmu."
            eyebrow="Pilih sesuai kebutuhan"
            title={<>Mulai gratis. Naik level saat <span className="dl-mark-pill">sudah siap</span>.</>}
            titleId="pricing-title"
          />

          <div aria-label="Pilih paket DekatLokal" className="dl-plan-list" role="group">
            {pricingPlans.map((plan, index) => {
              const isSelected = selectedPlanIndex === index;
              return (
                <button
                  aria-controls={detailId}
                  aria-pressed={isSelected}
                  className={`dl-plan-option${isSelected ? " is-selected" : ""}`}
                  key={plan.name}
                  onClick={() => setSelectedPlanIndex(index)}
                  type="button"
                >
                  <span aria-hidden="true" className="dl-plan-radio" />
                  <span className="dl-plan-copy">
                    <strong>{plan.name}</strong>
                    <small>{plan.description}</small>
                  </span>
                  <span className="dl-plan-price">
                    {plan.originalPrice ? <del>{plan.originalPrice}</del> : null}
                    <strong>{plan.price}</strong>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div aria-live="polite" id={detailId}>
          <AnimatePresence initial={false} mode="wait">
            <motion.article
              animate={{ opacity: 1, y: 0 }}
              className="dl-plan-detail"
              exit={{ opacity: 0, y: -8 }}
              initial={{ opacity: 0, y: 12 }}
              key={selectedPlan.name}
              transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="dl-plan-detail-head">
                <div>
                  <span>Paket {String(selectedPlanIndex + 1).padStart(2, "0")}</span>
                  <h3>{selectedPlan.name}</h3>
                </div>
                {selectedPlan.featured ? (
                  <span className="chip chip-primary">Pilihan lanjutan</span>
                ) : isFree ? (
                  <span className="chip chip-mint">Gratis</span>
                ) : (
                  <span className="chip chip-amber">Segera tersedia</span>
                )}
              </div>

              <div className="dl-plan-detail-price">
                <strong>{selectedPlan.price}</strong>
                <span>{isFree ? "tanpa biaya" : "sekali bayar"}</span>
                {selectedPlan.originalPrice ? <del>{selectedPlan.originalPrice}</del> : null}
              </div>
              {selectedPlan.saving ? <span className="chip chip-coral dl-plan-saving">{selectedPlan.saving}</span> : null}

              {isExternal ? (
                <a className={`btn btn-lg dl-plan-cta ${isFree ? "btn-primary" : "btn-secondary"}`} href={href} rel="noreferrer" target="_blank">{cta}</a>
              ) : (
                <Link className={`btn btn-lg dl-plan-cta ${isFree ? "btn-primary" : "btn-secondary"}`} href={href}>{cta}</Link>
              )}

              <p className="dl-plan-detail-desc">{selectedPlan.description}</p>

              <div className="dl-plan-features">
                <h4>Yang kamu dapatkan</h4>
                <ul>
                  {selectedPlan.features.map((feature) => (
                    <li key={feature}>
                      <span aria-hidden="true"><Check size={13} strokeWidth={3} /></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`note dl-plan-status${isFree ? " note-success" : " note-warning"}`}>
                <Info aria-hidden="true" size={18} style={{ flex: "0 0 auto", marginTop: 2 }} />
                <p>
                  <strong>{selectedPlan.status}</strong>
                  {selectedPlan.statusDetail}
                </p>
              </div>
            </motion.article>
          </AnimatePresence>
        </div>
      </div>

      <p className="dl-pricing-note">
        Mulai dari yang gratis dulu. Paket berbayar belum dibuka; kamu bisa tanya tim kami sebelum memilih.
      </p>
    </>
  );
}
