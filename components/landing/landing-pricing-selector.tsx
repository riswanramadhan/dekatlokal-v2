"use client";

import { useId, useState } from "react";
import { Check, LockKeyhole } from "lucide-react";

const pricingPlans = [
  {
    name: "Fondasi Gratis",
    price: "Rp0",
    description: "Mulai dari kondisi usaha dan tuntaskan tiga fokus paling penting.",
    features: [
      "Digital Checkup delapan aspek",
      "Tiga course fondasi personal",
      "Kuis dan tugas praktik usaha",
      "Aset Usaha dan Jejak Tumbuh",
    ],
    cta: "Mulai Gratis",
    hrefType: "checkup",
    status: "Aktivasi paket dijeda",
    statusDetail: "Informasi fondasi tetap dapat dilihat, tetapi tombol paket dinonaktifkan sementara.",
    featured: false,
  },
  {
    name: "Tumbuh Terarah",
    price: "Rp249.000",
    description: "Pendalaman mandiri untuk menguatkan hasil setelah fondasi selesai.",
    features: [
      "Semua manfaat Fondasi Gratis",
      "Empat course lanjutan",
      "Website company profile satu halaman siap tayang",
      "Pengelolaan media sosial dasar selama 30 hari",
      "Setup Google Business Profile dan katalog digital",
      "Jalur tindakan 90 hari, workbook, dan template premium",
    ],
    cta: "Aktifkan Paket",
    hrefType: "premium",
    status: "Segera tersedia",
    statusDetail: "Produksi website dan layanan media sosial sedang dipersiapkan.",
    featured: true,
  },
  {
    name: "Pendampingan Naik Kelas",
    price: "Rp799.000",
    description: "Belajar lebih terarah dengan klinik usaha dan review aset prioritas.",
    features: [
      "Semua manfaat Tumbuh Terarah",
      "Website company profile custom dengan beberapa section",
      "Pengelolaan media sosial 30 hari, termasuk 12 konten dan caption",
      "Optimasi Google Business Profile serta katalog produk",
      "Dua klinik usaha kelompok",
      "Review tiga Aset Usaha",
      "Laporan performa dan rencana aksi personal 30 hari",
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
  if (type === "premium") return "/app/premium";
  return "mailto:hello@dekatlokal.com?subject=Minat%20Pendampingan%20Naik%20Kelas";
}

export function LandingPricingSelector({ checkupHref }: { checkupHref: string }) {
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const detailId = useId();
  const selectedPlan = pricingPlans[selectedPlanIndex];

  return (
    <>
      <div className="dl-pricing-layout">
        <div className="dl-pricing-choice">
          <div className="dl-pricing-copy">
            <p className="dl-section-kicker">Mulai dari kebutuhan, bukan paket terbesar</p>
            <h2 id="pricing-title">
              Mulai gratis. Lanjut saat <span className="dl-title-pill">memang relevan</span>.
            </h2>
            <p>
              Tuntaskan fondasi gratis lebih dahulu, lalu pilih pendalaman sesuai hasil usaha dan tujuan
              berikutnya.
            </p>
          </div>

          <div aria-label="Pilih paket DekatLokal" className="dl-pricing-options">
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
                  <span className="dl-pricing-option-price">{plan.price}</span>
                </button>
              );
            })}
          </div>
        </div>

        <article
          aria-live="polite"
          className="dl-pricing-detail"
          id={detailId}
          key={selectedPlan.name}
        >
          <div className="dl-pricing-detail-head">
            <div>
              <span>Paket {String(selectedPlanIndex + 1).padStart(2, "0")}</span>
              <h3>{selectedPlan.name}</h3>
            </div>
            {selectedPlan.featured ? <span className="dl-pricing-popular">Paling relevan</span> : null}
          </div>

          <div className="dl-pricing-detail-price">
            <strong>{selectedPlan.price}</strong>
            <span>sekali bayar</span>
          </div>

          <button
            aria-label={`${selectedPlan.cta}, segera tersedia`}
            className="dl-pricing-detail-cta"
            data-intended-href={resolveHref(selectedPlan.hrefType, checkupHref)}
            disabled
            type="button"
          >
            <LockKeyhole aria-hidden="true" size={16} />
            <span>{selectedPlan.cta}</span>
            <small>Segera tersedia</small>
          </button>

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
        Semua tombol aktivasi paket dinonaktifkan sementara. Kamu tetap dapat membandingkan manfaat
        setiap paket untuk menentukan kebutuhan usahamu.
      </p>
    </>
  );
}
