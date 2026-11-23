"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { paletteStyle } from "@/lib/sites/palettes";
import { ChatRichText } from "./chat-rich-text";
import { WhatsAppGlyph } from "./parts";
import s from "./site-chat.module.css";

type Message = { role: "user" | "assistant"; content: string };
const MAX = 600;
const STARTERS = ["Lihat daftar harga", "Jam buka kapan?", "Lokasinya di mana?", "Cara pesannya gimana?"];

function newSessionId() {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Widget chat AI Admin di website UMKM. Hanya dirender server bila AI Admin & website aktif. */
export function SiteChat({ slug, businessName, welcome, whatsappUrl, palette }: { slug: string; businessName: string; welcome: string; whatsappUrl: string | null; palette: string }) {
  const storageKey = `dl-site-chat:${slug}`;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const sessionRef = useRef<string>("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  // Riwayat sesi disimpan di sessionStorage (hilang saat tab ditutup). Penyimpanan bisa diblokir: tetap jalan tanpa itu.
  useEffect(() => {
    let saved: { sessionId?: string; messages?: Message[] } = {};
    try { saved = JSON.parse(window.sessionStorage.getItem(storageKey) ?? "{}"); } catch { saved = {}; }
    sessionRef.current = typeof saved.sessionId === "string" && /^[A-Za-z0-9_-]{8,64}$/.test(saved.sessionId) ? saved.sessionId : newSessionId();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- memulihkan riwayat dari sessionStorage setelah hidrasi.
    if (Array.isArray(saved.messages)) setMessages(saved.messages.filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string").slice(-30));
  }, [storageKey]);
  useEffect(() => {
    try { window.sessionStorage.setItem(storageKey, JSON.stringify({ sessionId: sessionRef.current, messages: messages.slice(-30) })); } catch { /* penyimpanan diblokir */ }
  }, [messages, storageKey]);
  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight }); }, [messages, open]);
  const close = useCallback(() => {
    setOpen(false);
    // Kembalikan fokus ke tombol pembuka setelah panel tertutup.
    requestAnimationFrame(() => launcherRef.current?.focus());
  }, []);
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (event: globalThis.KeyboardEvent) => { if (event.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const send = async (text: string) => {
    const question = text.trim().slice(0, MAX);
    if (!question || busy) return;
    const history: Message[] = [...messages, { role: "user", content: question }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    const append = (chunk: string, replace = false) => setMessages((current) => {
      const next = [...current];
      const last = next[next.length - 1];
      next[next.length - 1] = { role: "assistant", content: replace ? chunk : (last?.content ?? "") + chunk };
      return next;
    });
    try {
      const response = await fetch(`/api/sites/${encodeURIComponent(slug)}/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: sessionRef.current, messages: history.slice(-12) }) });
      if ((response.headers.get("content-type") ?? "").includes("application/json")) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        append(`${data.error ?? "Maaf, chat sedang tidak tersedia."}${whatsappUrl ? ` Chat langsung lewat WhatsApp, ya: ${whatsappUrl}` : ""}`, true);
        return;
      }
      if (!response.body) { append(await response.text(), true); return; }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        append(decoder.decode(value, { stream: true }));
      }
    } catch {
      append(`Koneksi terputus. Coba lagi sebentar${whatsappUrl ? `, atau chat langsung di WhatsApp: ${whatsappUrl}` : "."}`, true);
    } finally {
      setBusy(false);
    }
  };

  const submit = (event: FormEvent) => { event.preventDefault(); void send(input); };
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void send(input); }
  };
  const hasAsked = messages.some((m) => m.role === "user");

  return <div className={s.widget} style={paletteStyle(palette)}>
    {!open ? <button ref={launcherRef} type="button" className={s.launcher} onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label={`Chat dengan admin ${businessName}`}>
      <MessageCircle size={22} aria-hidden="true" /><span>Tanya admin</span>
    </button> : null}
    {open ? <section className={s.panel} role="dialog" aria-modal="false" aria-label={`Chat dengan admin ${businessName}`}>
      <header className={s.head}>
        <span className={s.avatar} aria-hidden="true">{businessName.slice(0, 1).toUpperCase()}</span>
        <div className={s.headText}><strong>Admin {businessName}</strong><small>Dijawab otomatis oleh AI · pesanan lewat WhatsApp</small></div>
        <button type="button" className={s.close} onClick={close} aria-label="Tutup chat"><X size={20} aria-hidden="true" /></button>
      </header>
      <div ref={listRef} className={s.list} aria-live="polite">
        <div className={s.bot}><ChatRichText text={welcome} className={s.rich} /></div>
        {messages.map((message, index) => message.role === "user"
          ? <div key={index} className={s.user}>{message.content}</div>
          : <div key={index} className={s.bot}>{message.content ? <ChatRichText text={message.content} className={s.rich} /> : <span className={s.typing} aria-label="Sedang mengetik"><i /><i /><i /></span>}</div>)}
        {!hasAsked ? <div className={s.starters}>{STARTERS.map((item) => <button key={item} type="button" onClick={() => void send(item)} disabled={busy}>{item}</button>)}</div> : null}
      </div>
      <form className={s.form} onSubmit={submit}>
        <label className={s.srOnly} htmlFor={`chat-${slug}`}>Tulis pertanyaan</label>
        <textarea id={`chat-${slug}`} ref={inputRef} rows={1} maxLength={MAX} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={onKeyDown} placeholder="Tulis pertanyaanmu…" />
        <button type="submit" className={s.send} disabled={busy || !input.trim()} aria-label="Kirim"><Send size={18} aria-hidden="true" /></button>
      </form>
      <div className={s.foot}>
        {input.length > MAX - 100 ? <small>{input.length}/{MAX}</small> : <small>Jangan kirim data pribadi seperti PIN atau kata sandi.</small>}
        {whatsappUrl ? <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"><WhatsAppGlyph size={15} /> WhatsApp</a> : null}
      </div>
    </section> : null}
  </div>;
}
