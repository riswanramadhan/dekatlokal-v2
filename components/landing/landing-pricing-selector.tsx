"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

const pricingPlans = [
  {
    name: "Mulai",
    price: "Rp0",
    originalPrice: null,
    saving: null,
    description: "Mulai dari kondisi usaha dan tuntaskan tiga fokus paling penting.",
    features: [
      "Cek delapan bagian penting usahamu",
      "Tiga kelas dasar sesuai kebutuhanmu",
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
      "Empat kelas lanjutan",
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
  if (type === "premium") return "mailto:hello@dekatlokal.com?subject=Tanya%20Paket%20Tumbuh";
  return "mailto:hello@dekatlokal.com?subject=Minat%20Paket%20Melesat";
}

export function LandingPricingSelector({ checkupHref }: { checkupHref: string }) {
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const detailId = useId();
  const selectedPlan = pricingPlans[selectedPlanIndex];

  return (
    <>
      <div className="dl-pricing-layout">
        <div className="dl-pricing-choice">
          <div className="dl-pricing-copy" data-reveal-item>
            <p className="dl-section-kicker">Pilih sesuai kebutuhan</p>
            <h2 id="pricing-title">
              Mulai gratis. Naik level saat <span className="dl-title-pill">sudah siap</span>.
            </h2>
            <p>
              Bereskan fondasinya dulu. Kalau butuh pendampingan lebih jauh, pilih paket yang benar-benar cocok dengan tujuanmu.
            </p>
          </div>

          <div aria-label="Pilih paket DekatLokal" className="dl-pricing-options" data-reveal-item>
            {pricingPlans.map((plan, index) => {
              const isSelected = selectedPlanIndex === index;

              return (
                <button
                  aria-controls={detailId}
                  aria-pressed={isSelected}
                  className={`dl-pricing-option${isSelected ? " is-selected" : ""}`}
                  key={plan.name}
                  onClick={() => setSelectedPlanIndex(index)}
                  type="button"
                >
                  <span aria-hidden="true" className="dl-pricing-radio" />
                  <span className="dl-pricing-option-copy">
                    <strong>{plan.name}</strong>
                    <small>{plan.description}</small>
                  </span>
                  <span className="dl-pricing-option-price">
                    {plan.originalPrice ? <del>{plan.originalPrice}</del> : null}
                    <strong>{plan.price}</strong>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <article
          aria-live="polite"
          className="dl-pricing-detail"
          data-reveal-item
          id={detailId}
          key={selectedPlan.name}
        >
          <div className="dl-pricing-detail-head">
            <div>
              <span>Paket {String(selectedPlanIndex + 1).padStart(2, "0")}</span>
              <h3>{selectedPlan.name}</h3>
            </div>
            {selectedPlan.featured ? <span className="dl-pricing-popular">Pilihan lanjutan</span> : null}
          </div>

          <div className="dl-pricing-detail-price">
            {selectedPlan.originalPrice ? <del>{selectedPlan.originalPrice}</del> : null}
            <strong>{selectedPlan.price}</strong>
            <span>{selectedPlan.hrefType === "checkup" ? "tanpa biaya" : "sekali bayar"}</span>
          </div>
          {selectedPlan.saving ? <span className="dl-pricing-discount">{selectedPlan.saving}</span> : null}

          <Link className="dl-pricing-detail-cta" href={resolveHref(selectedPlan.hrefType, checkupHref)}>
            <span>{selectedPlan.hrefType === "checkup" ? "Mulai Gratis" : "Tanya Paket Ini"}</span>
            <ArrowRight aria-hidden="true" size={18} />
          </Link>

          <p className="dl-pricing-detail-description">{selectedPlan.description}</p>

          <div className="dl-pricing-features">
            <h4>Yang kamu dapatkan</h4>
            <ul>
              {selectedPlan.features.map((feature) => (
                <li key={feature}>
                  <span aria-hidden="true">
                    <Check size={14} />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="dl-pricing-status">
            <span aria-hidden="true" />
            <p>
              <strong>{selectedPlan.status}</strong>
              {selectedPlan.statusDetail}
            </p>
          </div>
        </article>
      </div>

      <p className="dl-pricing-note">
        Mulai dari yang gratis dulu. Paket berbayar belum dibuka; kamu bisa tanya tim kami sebelum memilih.
      </p>
    </>
  );
}
