"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { TRIAL_DAYS, formatRupiah, priceLabel, productByCode } from "@/lib/commerce/catalog";

// Harga diambil dari katalog produk (lib/commerce/catalog.ts) agar selalu sama dengan halaman pesanan.
const site = productByCode("site_upgrade")!, aiAdmin = productByCode("ai_admin_monthly")!;
const pro = productByCode("checkup_pro")!, gbp = productByCode("gbp_optimization")!, care = productByCode("website_care_monthly")!;

const pricingPlans = [
  {
    name: "Mulai",
    price: "Rp0",
    priceNote: "tanpa biaya",
    description: "Cek kondisi usaha dan mulai belajar dari tiga fokus paling penting.",
    features: [
      "Cek delapan bagian penting usahamu",
      "Urutan tujuh modul sesuai kebutuhanmu",
      "Akses modul, latihan, dan kuis gratis 7 hari",
      "Laporan PDF ringkas hasil checkup",
    ],
    cta: "Mulai Gratis",
    href: "checkup",
    status: "Tersedia sekarang",
    statusDetail: "Cek usahamu dulu. Pilih langkah berikutnya setelah melihat hasilnya.",
    featured: false,
  },
  {
    name: "Website",
    price: formatRupiah(site.price),
    priceNote: "sekali bayar",
    description: "Website usaha dari template. Coba gratis dulu, bayar kalau ingin dipertahankan.",
    features: [
      `Pilih template dan coba gratis ${TRIAL_DAYS.site_publish ?? 14} hari`,
      ...site.bullets,
      `Opsional: ${aiAdmin.name} ${priceLabel(aiAdmin)}, bisa dicoba gratis ${TRIAL_DAYS.ai_admin ?? 7} hari`,
    ],
    cta: "Pilih Template",
    href: "/templates",
    status: "Tersedia sekarang",
    statusDetail: "Mulai dari template gratis. Bayar lewat WhatsApp atau transfer hanya kalau kamu ingin website tetap online.",
    featured: true,
  },
  {
    name: "Layanan Pro",
    price: `Mulai ${formatRupiah(Math.min(pro.price, gbp.price, care.price))}`,
    priceNote: "pilih sesuai kebutuhan",
    description: "Bantuan langsung dari tim: laporan lengkap, profil Google, dan perawatan website.",
    features: [
      `${pro.name} ${priceLabel(pro)}: laporan PDF detail, rencana aksi 30 hari, dan konsultasi 30 menit`,
      `${gbp.name} ${priceLabel(gbp)}: rapikan kategori, jam buka, foto, dan produk di Google Maps`,
      `${care.name} ${priceLabel(care)}: update konten hingga 3 kali per bulan, pemantauan, dan backup`,
      "Bayar manual lewat WhatsApp atau transfer, aktif setelah dikonfirmasi admin",
    ],
    cta: "Lihat Layanan Pro",
    href: "/layanan-pro",
    status: "Tersedia sekarang",
    statusDetail: "Kami merapikan profil sesuai panduan Google, tetapi posisi di hasil pencarian tidak bisa dijamin.",
    featured: false,
  },
] as const;

function resolveHref(href: (typeof pricingPlans)[number]["href"], checkupHref: string) {
  return href === "checkup" ? checkupHref : href;
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
            <strong>{selectedPlan.price}</strong>
            <span>{selectedPlan.priceNote}</span>
          </div>

          <Link className="dl-pricing-detail-cta" href={resolveHref(selectedPlan.href, checkupHref)}>
            <span>{selectedPlan.cta}</span>
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
        Mulai dari yang gratis dulu. Layanan berbayar dibayar manual lewat WhatsApp atau transfer dan baru aktif setelah dikonfirmasi admin.
      </p>
    </>
  );
}
