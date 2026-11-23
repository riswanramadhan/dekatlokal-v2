"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Inbox, RefreshCw } from "lucide-react";
import { api } from "@/components/digital-checkup/api";
import { OrderButton, TrialButton } from "@/components/commerce/order-button";
import type { AccessState } from "@/lib/commerce/access";
import type { AiStage } from "@/lib/sites/access";
import { LIMITS, type SiteAi } from "@/lib/sites/schema";
import type { ConversationDetail, ConversationSummary } from "@/lib/sites/types";
import { ChatRichText } from "../chat-rich-text";

const dateTime = (value: string) => new Date(value).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const dateOnly = (value: string) => new Date(value).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

/** Pengaturan, status langganan, dan kotak masuk AI Admin untuk satu website. */
export function AiAdminPanel({ siteId, path, live, stage, access, ai, defaultWelcome, priceLabel }: {
  siteId: string;
  path: string;
  live: boolean;
  stage: AiStage;
  access: AccessState;
  ai: SiteAi;
  defaultWelcome: string;
  priceLabel: string;
}) {
  const router = useRouter();
  const [settings, setSettings] = useState<SiteAi>(ai);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[] | null>(null);
  const [inboxError, setInboxError] = useState("");
  const [selected, setSelected] = useState<ConversationDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState("");

  const loadInbox = useCallback(async () => {
    setInboxError("");
    try { setConversations((await api<{ conversations: ConversationSummary[] }>(`sites/${siteId}/inbox`)).conversations); }
    catch (e) { setInboxError(e instanceof Error ? e.message : "Kotak masuk belum bisa dimuat."); }
  }, [siteId]);
  useEffect(() => {
    let live = true;
    void api<{ conversations: ConversationSummary[] }>(`sites/${siteId}/inbox`)
      .then((r) => { if (live) setConversations(r.conversations); })
      .catch((e: Error) => { if (live) setInboxError(e.message); });
    return () => { live = false; };
  }, [siteId]);

  const open = async (sessionId: string) => {
    setLoadingDetail(sessionId);
    try { setSelected((await api<{ conversation: ConversationDetail }>(`sites/${siteId}/inbox?session=${encodeURIComponent(sessionId)}`)).conversation); }
    catch (e) { setInboxError(e instanceof Error ? e.message : "Percakapan belum bisa dibuka."); }
    finally { setLoadingDetail(""); }
  };

  const save = async () => {
    setSaving(true); setNotice(null);
    try {
      await api(`sites/${siteId}`, "PATCH", { ai: settings });
      setNotice({ tone: "ok", text: "Pengaturan AI Admin tersimpan." });
      router.refresh();
    } catch (e) { setNotice({ tone: "error", text: e instanceof Error ? e.message : "Belum tersimpan. Coba lagi." }); }
    finally { setSaving(false); }
  };

  return <div className="sb-ai">
    <section className="sb-ai-status dc-panel">
      <div className="sb-ai-icon" aria-hidden="true"><Bot size={26} /></div>
      <div className="sb-ai-copy">
        {stage === "available" ? <>
          <h2>AI Admin menjawab pelanggan 24 jam</h2>
          <p>Asisten chat di websitemu menjawab pertanyaan harga, menu, jam buka, dan lokasi memakai data websitemu, lalu mengarahkan pembeli serius ke WhatsApp-mu. Coba gratis 7 hari, tanpa kartu kredit.</p>
          <TrialButton feature="ai_admin" resourceId={siteId} label="Coba AI Admin gratis 7 hari" className="dc-primary" onStarted={() => router.refresh()} />
        </> : stage === "trial" ? <>
          <span className="dc-badge">Masa coba · {access.daysLeft ?? 0} hari lagi</span>
          <h2>AI Admin aktif</h2>
          <p>Lanjutkan setelah masa coba supaya chat tetap tampil. {priceLabel}, bayar manual lewat WhatsApp admin DekatLokal.</p>
          <OrderButton product="ai_admin_monthly" resourceId={siteId} label={`Langganan ${priceLabel}`} className="dc-primary" />
        </> : stage === "paid" ? <>
          <span className="dc-badge">Langganan aktif{access.expiresAt ? ` sampai ${dateOnly(access.expiresAt)}` : ""}</span>
          <h2>AI Admin aktif</h2>
          <p>Perpanjang sebelum masa aktif habis; bulan baru ditambahkan dari tanggal berakhir.</p>
          <OrderButton product="ai_admin_monthly" resourceId={siteId} label="Perpanjang 1 bulan" className="dc-secondary" />
        </> : <>
          <span className="dc-badge">Masa coba selesai</span>
          <h2>Aktifkan lagi AI Admin</h2>
          <p>Chat sedang tidak tampil di websitemu. Percakapan lama tetap tersimpan di kotak masuk.</p>
          <OrderButton product="ai_admin_monthly" resourceId={siteId} label={`Aktifkan ${priceLabel}`} className="dc-primary" />
        </>}
        {!live && stage !== "ended" ? <p className="dc-note">Chat hanya tampil saat website sudah terbit dan aktif.</p> : null}
        {live && (stage === "trial" || stage === "paid") && settings.enabled ? <a className="dc-text-button" href={path} target="_blank" rel="noopener noreferrer">Coba chat di websitemu</a> : null}
      </div>
    </section>

    <section className="dc-panel sb-ai-settings">
      <h2>Pengaturan</h2>
      <label className="dc-check"><input type="checkbox" checked={settings.enabled} onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })} /><span>Tampilkan chat AI Admin di website</span></label>
      <label className="dc-field">Sapaan pembuka
        <textarea rows={2} maxLength={LIMITS.welcome} value={settings.welcome} placeholder={defaultWelcome} onChange={(e) => setSettings({ ...settings, welcome: e.target.value })} />
        <small>{settings.welcome.length}/{LIMITS.welcome} · kosongkan untuk memakai sapaan bawaan.</small>
      </label>
      <label className="dc-field">Pengetahuan tambahan
        <textarea rows={7} maxLength={LIMITS.extraKnowledge} value={settings.extraKnowledge} placeholder={"Contoh:\n- Promo Jumat: gratis es teh untuk pembelian 2 porsi.\n- Area antar: Panakkukang, Tamalate, Rappocini (ongkir Rp5.000–10.000).\n- Libur setiap tanggal merah."} onChange={(e) => setSettings({ ...settings, extraKnowledge: e.target.value })} />
        <small>{settings.extraKnowledge.length}/{LIMITS.extraKnowledge} · promo, area antar, cara bayar, jam khusus. Produk & harga diambil otomatis dari isi website.</small>
      </label>
      {notice ? <p className={notice.tone === "error" ? "cm-order-error" : "cm-order-note"} role={notice.tone === "error" ? "alert" : "status"}>{notice.text}</p> : null}
      <button type="button" className="dc-primary" disabled={saving} onClick={() => void save()}>{saving ? "Menyimpan…" : "Simpan pengaturan"}</button>
    </section>

    <section className="dc-panel sb-inbox" aria-labelledby="kotak-masuk">
      <div className="sb-inbox-head">
        <h2 id="kotak-masuk"><Inbox size={20} aria-hidden="true" /> Kotak masuk</h2>
        <button type="button" className="dc-text-button" onClick={() => void loadInbox()}><RefreshCw size={14} aria-hidden="true" /> Muat ulang</button>
      </div>
      {inboxError ? <p className="dc-error" role="alert">{inboxError}</p> : null}
      {conversations === null && !inboxError ? <p>Memuat percakapan…</p> : null}
      {conversations?.length === 0 ? <p className="sb-help">Belum ada percakapan. Setelah AI Admin aktif, pertanyaan pelanggan akan muncul di sini.</p> : null}
      {conversations?.length ? <div className="sb-inbox-layout">
        <ul className="sb-inbox-list">
          {conversations.map((item) => <li key={item.sessionId}>
            <button type="button" aria-current={selected?.sessionId === item.sessionId ? "true" : undefined} onClick={() => void open(item.sessionId)}>
              <strong>{item.lastMessage || "(tanpa teks)"}</strong>
              <small>{dateTime(item.updatedAt)} · {item.messageCount} pesan{loadingDetail === item.sessionId ? " · membuka…" : ""}</small>
            </button>
          </li>)}
        </ul>
        <div className="sb-inbox-detail" aria-live="polite">
          {selected ? <>
            <p className="sb-help">Pelanggan anonim · mulai {dateTime(selected.createdAt)}. Jawaban lanjutan diberikan saat pelanggan menghubungi WhatsApp-mu.</p>
            <ol className="sb-thread">
              {selected.messages.map((message, index) => <li key={index} className={message.role === "user" ? "is-user" : "is-bot"}>
                <small>{message.role === "user" ? "Pelanggan" : "AI Admin"}{message.at ? ` · ${dateTime(message.at)}` : ""}</small>
                {message.role === "user" ? <p>{message.content}</p> : <ChatRichText text={message.content} />}
              </li>)}
            </ol>
          </> : <p className="sb-help">Pilih percakapan untuk melihat isinya.</p>}
        </div>
      </div> : null}
    </section>
  </div>;
}
