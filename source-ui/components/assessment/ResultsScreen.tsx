import { useCallback, useEffect } from "react";
import { Icon } from "@iconify/react";
import { motion } from "motion/react";
import {
  buildCategoryBreakdown,
  getBarColor,
  getRecommendations,
  getResultCtaConfig,
  getScoreCategory,
  LOW_SCORE_THRESHOLD,
} from "@/features/digital-checkup/results";
import { DIGITAL_MAX_SCORE } from "@/lib/scraping/scoring";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { DIGITAL_CHECKUP_RECOMMENDATION_PATH } from "@/lib/host-routing";
import type {
  Answers,
  AssessmentResponse,
  DigitalPresenceData,
  QuestionGroup,
} from "./types";

// ── Constants ──────────────────────────────────────────────
const NUMBER_FORMATTER = new Intl.NumberFormat("id-ID");

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return NUMBER_FORMATTER.format(value);
}

interface ResultsScreenProps {
  answers: Answers;
  questionGroups: QuestionGroup[];
  responseData: AssessmentResponse | null;
  onBackHome: () => void;
}

// ── Platform card helper ───────────────────────────────────

function PlatformCard({ platform, children }: { platform: { name: string; icon: string; color: string; bg: string }; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 ${platform.bg} rounded-xl flex items-center justify-center`}>
          <Icon icon={platform.icon} className={`w-5 h-5 ${platform.color}`} />
        </div>
        <span className="font-semibold text-neutral-900">{platform.name}</span>
      </div>
      {children}
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-neutral-50 last:border-0">
      <span className="text-sm text-neutral-500">{label}</span>
      <span className="text-sm font-semibold text-neutral-900 text-right">{value}</span>
    </div>
  );
}

// ── Digital presence section ───────────────────────────────

function DigitalPresenceSection({ data }: { data: DigitalPresenceData | null }) {
  const instagram = data?.instagram ?? null;
  const tiktok = data?.tiktok ?? null;
  const google = data?.google ?? null;
  const scoring = data?.scoring ?? null;
  const hasAnyData = instagram || tiktok || google;

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-neutral-900 mb-2">Jejak Digital Bisnis</h2>
      <p className="text-neutral-500 mb-6 text-sm">
        {hasAnyData
          ? "Ringkasan ini membaca kanal digital bisnis Anda dari platform publik yang relevan"
          : "Belum ada data digital yang terdeteksi. Isi username Instagram, TikTok, atau link Google Maps saat checkup untuk mendapatkan analisis otomatis."}
      </p>

      {!hasAnyData && (
        <div className="bg-neutral-50 rounded-2xl p-6 border border-dashed border-neutral-300 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-neutral-200 rounded-xl flex items-center justify-center shrink-0">
              <Icon icon="mdi:cellphone-link" className="w-5 h-5 text-neutral-500" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-700 mb-1">Mengapa jejak digital penting?</h3>
              <p className="text-sm text-neutral-500 mb-3">
                Memiliki profil aktif di Instagram, TikTok, dan Google Business secara signifikan meningkatkan kesiapan digital bisnis Anda.
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  { name: "Instagram", icon: "mdi:instagram", color: "text-pink-600" },
                  { name: "TikTok", icon: "ic:baseline-tiktok", color: "text-neutral-700" },
                  { name: "Google Business", icon: "mdi:google-maps", color: "text-blue-600" },
                ].map((p) => (
                  <span key={p.name} className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 bg-white px-3 py-1.5 rounded-full border border-neutral-200">
                    <Icon icon={p.icon} className={`w-4 h-4 ${p.color}`} />
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {instagram && (
          <PlatformCard platform={{ name: "Instagram", icon: "mdi:instagram", color: "text-pink-600", bg: "bg-pink-50" }}>
            <StatItem label="Username" value={`@${instagram.username}`} />
            <StatItem label="Followers" value={formatNumber(instagram.followersCount)} />
            <StatItem label="Following" value={formatNumber(instagram.followingCount)} />
            <StatItem label="Postingan" value={formatNumber(instagram.postsCount)} />
            <StatItem label="Akun Bisnis" value={instagram.isBusinessAccount ? "Ya" : "Tidak"} />
            <StatItem label="Bio" value={instagram.biography ? "Terisi" : "Kosong"} />
          </PlatformCard>
        )}

        {tiktok && (
          <PlatformCard platform={{ name: "TikTok", icon: "ic:baseline-tiktok", color: "text-neutral-900", bg: "bg-neutral-100" }}>
            <StatItem label="Username" value={`@${tiktok.username}`} />
            <StatItem label="Followers" value={formatNumber(tiktok.followersCount)} />
            <StatItem label="Following" value={formatNumber(tiktok.followingCount)} />
            <StatItem label="Likes" value={formatNumber(tiktok.likesCount)} />
            <StatItem label="Video" value={formatNumber(tiktok.videosCount)} />
          </PlatformCard>
        )}

        {google && (
          <PlatformCard platform={{ name: "Google Business", icon: "mdi:google-maps", color: "text-blue-600", bg: "bg-blue-50" }}>
            <StatItem label="Nama" value={google.name} />
            <StatItem label="Rating" value={google.rating !== null ? `${google.rating}/5` : "-"} />
            <StatItem label="Ulasan" value={formatNumber(google.totalReviews)} />
            <StatItem label="Kategori" value={google.category ?? "-"} />
            <StatItem label="Website" value={google.website ? "Ada" : "Tidak ada"} />
            {google.address && <StatItem label="Alamat" value={google.address} />}
          </PlatformCard>
        )}
      </div>

      {/* Digital Scoring Breakdown */}
      {scoring && scoring.items.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-900">Skor Digital Presence</h3>
            <span className="text-sm font-bold text-primary">
              {scoring.totalScore}/{scoring.maxScore}
            </span>
          </div>
          <div className="space-y-2">
            {scoring.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-1.5">
                <Icon
                  icon={item.score > 0 ? "mdi:check-circle" : "mdi:close-circle"}
                  className={`w-5 h-5 shrink-0 ${item.score > 0 ? "text-success" : "text-neutral-300"}`}
                />
                <span className={`flex-1 text-sm ${item.score > 0 ? "text-neutral-900" : "text-neutral-400"}`}>
                  {item.label}
                </span>
                <span className="text-xs text-neutral-400">{item.detail}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Scoring helpers ────────────────────────────────────────

// ── Main component ─────────────────────────────────────────

export function ResultsScreen({ answers, questionGroups, responseData, onBackHome }: ResultsScreenProps) {
  const score = responseData?.percentage ?? 0;
  const category = getScoreCategory(score);
  const businessName = (answers["umkm-name"] as string) || "Bisnis Anda";

  const handleWhatsAppClick = useCallback(() => {
    if (!responseData?.id) return;
    // Fire-and-forget: track click without blocking navigation
    fetch(`/api/assessment/${responseData.id}/whatsapp-click`, {
      method: "PATCH",
    }).catch(() => {
      // Non-critical: silently ignore failures
    });
  }, [responseData]);

  // ── Build category breakdown dynamically from scored groups ──
  // Digital denominator uses strict baseline (enabled platforms), then
  // follows backend compensation via maxScoreForResponse when system errors occur.
  const digitalScoring = responseData?.digitalPresence?.scoring;
  const digitalEarned = digitalScoring?.totalScore ?? 0;

  const digitalMax =
    responseData?.digitalPresence?.maxScoreForResponse ?? DIGITAL_MAX_SCORE;
  const categoryBreakdown = buildCategoryBreakdown(
    questionGroups,
    answers,
    digitalEarned,
    digitalMax,
  );

  // ── Generate recommendations from low-scoring categories ──
  const recommendations = getRecommendations(categoryBreakdown);

  useEffect(() => {
    if (window.location.pathname !== DIGITAL_CHECKUP_RECOMMENDATION_PATH) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      document
        .getElementById("rekomendasi")
        ?.scrollIntoView({ block: "start" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  // ── CTA config based on score ──
  const { isReady, config: ctaConfig } = getResultCtaConfig(
    score,
    businessName,
  );

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${category.bg} ${category.color} mb-4`}>
          <Icon icon={category.icon} className="w-5 h-5" />
          <span className="font-semibold">{category.label}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">
          Hasil Digital Checkup
        </h1>
        <p className="text-lg text-neutral-600">
          Ringkasan kesiapan digital untuk <span className="font-semibold">{businessName}</span>
        </p>
      </motion.div>

      {/* Score Card */}
      <motion.div
        className="bg-linear-to-br from-primary to-primary-600 rounded-3xl p-8 text-white mb-8"
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-2 opacity-90">Skor Kesiapan Digital</h2>
            <p className="text-white/70 max-w-md">
              Skor ini menunjukkan tingkat kesiapan bisnis Anda dalam mengadopsi teknologi digital.
            </p>
          </div>
          <div className="relative">
            <div className="w-40 h-40 relative">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="10"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="white"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${score * 2.83} 283`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold">{score}</span>
                <span className="text-sm opacity-70">dari 100</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CTA: Next Step (prominent, shown early) */}
      <motion.div
        className={`rounded-3xl p-8 mb-8 border-2 ${
          isReady
            ? "bg-linear-to-br from-success/5 to-success/10 border-success/20"
            : "bg-linear-to-br from-warning/5 to-warning/10 border-warning/20"
        }`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
      >
        <div className="flex flex-col items-center text-center gap-6">
          {/* Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold ${ctaConfig.badge.bg} ${ctaConfig.badge.color}`}>
            <Icon icon={ctaConfig.badge.icon} className="w-4 h-4" />
            {ctaConfig.badge.text}
          </div>

          {/* Heading */}
          <h3 className="text-xl md:text-2xl font-bold text-neutral-900 leading-snug">
            {ctaConfig.heading}
          </h3>

          {/* Body */}
          <p className="text-neutral-600 max-w-xl text-sm md:text-base">
            {ctaConfig.body}
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <a
              href={buildWhatsAppUrl(ctaConfig.whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsAppClick}
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-[#1ebe5a] hover:shadow-lg hover:shadow-[#25D366]/25 text-sm md:text-base"
            >
              <Icon icon="ic:baseline-whatsapp" className="w-5 h-5 shrink-0" />
              {ctaConfig.primaryLabel}
            </a>
            <button
              type="button"
              onClick={onBackHome}
              className="inline-flex items-center justify-center gap-2 border-2 border-neutral-200 text-neutral-700 px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:bg-neutral-50 text-sm md:text-base"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </motion.div>

      {/* Digital Presence Data: always shown */}
      <DigitalPresenceSection data={responseData?.digitalPresence ?? null} />

      {/* Category Breakdown */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Skor per Kategori</h2>
        <p className="text-neutral-500 mb-6 text-sm">
          Rincian skor berdasarkan setiap aspek checkup
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryBreakdown.map((item, i) => (
            <motion.div
              key={item.id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, ease: "easeOut", delay: i * 0.08 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  item.percent >= 60 ? "bg-success/10" : item.percent >= 40 ? "bg-warning/10" : "bg-error/10"
                }`}>
                  <Icon icon={item.icon} className={`w-5 h-5 ${
                    item.percent >= 60 ? "text-success" : item.percent >= 40 ? "text-warning" : "text-error"
                  }`} />
                </div>
                <span className="font-semibold text-neutral-900 text-sm">{item.label}</span>
              </div>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-2xl font-bold text-neutral-900">{item.percent}</span>
                <span className="text-neutral-400 text-sm">/100</span>
              </div>
              <p className="text-xs text-neutral-400 mb-3">
                {item.earned}/{item.max} poin
              </p>
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColor(item.percent)}`}
                  style={{ width: `${item.percent}%` }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recommendations: only shown when there are low-scoring categories */}
      {recommendations.length > 0 && (
        <motion.div
          id="rekomendasi"
          className="scroll-mt-6 bg-white rounded-3xl p-8 shadow-sm border border-neutral-100 mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            Rekomendasi untuk Anda
          </h2>
          <p className="text-neutral-500 mb-6 text-sm">
            Berdasarkan kategori dengan skor di bawah {LOW_SCORE_THRESHOLD}%
          </p>
          <div className="space-y-4">
            {recommendations.map((rec, i) => (
              <motion.div
                key={rec.title}
                className={`flex items-start gap-4 p-4 rounded-xl border-2 ${
                  rec.priority === "high"
                    ? "border-error/30 bg-error/5"
                    : "border-warning/30 bg-warning/5"
                }`}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease: "easeOut", delay: i * 0.1 }}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  rec.priority === "high"
                    ? "bg-error/10 text-error"
                    : "bg-warning/10 text-warning"
                }`}>
                  <Icon icon={rec.icon} className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-neutral-900">{rec.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      rec.priority === "high"
                        ? "bg-error/10 text-error"
                        : "bg-warning/10 text-warning"
                    }`}>
                      {rec.priority === "high" ? "Prioritas Tinggi" : "Prioritas Sedang"}
                    </span>
                  </div>
                  <p className="text-neutral-600 text-sm">{rec.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Bottom CTA: repeated intent at natural exit point */}
      <motion.div
        className="rounded-3xl border border-neutral-200 bg-white p-6 md:p-7 mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-1">
              Butuh arahan langkah berikutnya?
            </p>
            <h3 className="text-lg md:text-xl font-bold text-neutral-900">
              {isReady
                ? "Lanjutkan verifikasi website bisnis Anda"
                : "Mulai pembinaan digital untuk tingkatkan kesiapan bisnis"}
            </h3>
            <p className="text-sm text-neutral-600 mt-1">
              Konsultasi langsung dengan tim DekatLokal melalui WhatsApp untuk pendampingan yang sesuai hasil Digital Checkup.
            </p>
          </div>

          <a
            href={buildWhatsAppUrl(ctaConfig.whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsAppClick}
            className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-5 py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-[#1ebe5a] hover:shadow-lg hover:shadow-[#25D366]/25 text-sm md:text-base md:shrink-0"
          >
            <Icon icon="ic:baseline-whatsapp" className="w-5 h-5 shrink-0" />
            Hubungi via WhatsApp
          </a>
        </div>
      </motion.div>
    </div>
  );
}
