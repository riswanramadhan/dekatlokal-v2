"use client";

import { useEffect, useRef, useState, type FormEvent, type MutableRefObject } from "react";

type ChatMessage = {
  role: "assistant" | "user";
  text: string;
};

type UiSound = "open" | "close" | "send" | "thinking" | "done";

function playUiSound(audioContextRef: MutableRefObject<AudioContext | null>, sound: UiSound) {
  if (typeof window === "undefined") return;

  const AudioContextCtor =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextCtor) return;

  const context = audioContextRef.current ?? new AudioContextCtor();
  audioContextRef.current = context;
  void context.resume();

  const now = context.currentTime;
  const patterns: Record<UiSound, Array<{ frequency: number; offset: number; duration: number; type: OscillatorType; volume: number }>> = {
    open: [
      { frequency: 520, offset: 0, duration: 0.07, type: "sine", volume: 0.032 },
      { frequency: 880, offset: 0.07, duration: 0.1, type: "triangle", volume: 0.038 },
    ],
    close: [
      { frequency: 620, offset: 0, duration: 0.06, type: "triangle", volume: 0.026 },
      { frequency: 360, offset: 0.055, duration: 0.09, type: "sine", volume: 0.03 },
    ],
    send: [
      { frequency: 760, offset: 0, duration: 0.055, type: "triangle", volume: 0.038 },
      { frequency: 1180, offset: 0.045, duration: 0.075, type: "sine", volume: 0.032 },
    ],
    thinking: [
      { frequency: 410, offset: 0.02, duration: 0.055, type: "sine", volume: 0.018 },
      { frequency: 510, offset: 0.13, duration: 0.055, type: "sine", volume: 0.016 },
    ],
    done: [
      { frequency: 660, offset: 0, duration: 0.075, type: "triangle", volume: 0.03 },
      { frequency: 990, offset: 0.075, duration: 0.095, type: "sine", volume: 0.034 },
      { frequency: 1320, offset: 0.16, duration: 0.09, type: "sine", volume: 0.026 },
    ],
  };

  patterns[sound].forEach(({ frequency, offset, duration, type, volume }) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const startAt = now + offset;
    const endAt = startAt + duration;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startAt);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, endAt);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startAt);
    oscillator.stop(endAt + 0.02);
  });
}

function RobotIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path d="M16 4v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="3" r="1.5" fill="currentColor" />
      <rect x="5" y="9" width="22" height="17" rx="6" fill="currentColor" opacity="0.18" />
      <rect x="7.5" y="11.5" width="17" height="12" rx="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="12.5" cy="17.5" r="1.5" fill="currentColor" />
      <circle cx="19.5" cy="17.5" r="1.5" fill="currentColor" />
      <path d="M12.5 21h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7.5 15H5.8a2 2 0 0 0 0 4h1.7M24.5 15h1.7a2 2 0 0 1 0 4h-1.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    ),
  );
}

function RichReply({ text }: { text: string }) {
  return (
    <div className="space-y-1.5">
      {text.split("\n").map((line, index) =>
        line.trim().startsWith("-") ? (
          <p key={`${line}-${index}`} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            <span>{renderInline(line.trim().slice(1).trim())}</span>
          </p>
        ) : (
          <p key={`${line}-${index}`}>{renderInline(line)}</p>
        ),
      )}
    </div>
  );
}

export default function DekatAIWidget({ hidden = false }: { hidden?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Hai! Aku **DekatAI**. Mau cari tahu layanan website atau program digital DekatLokal?",
    },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (hidden) setIsOpen(false);
  }, [hidden]);

  useEffect(() => {
    if (
      isOpen &&
      window.matchMedia("(min-width: 768px) and (hover: hover) and (pointer: fine)").matches
    ) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const question = input.trim();
    if (!question || isLoading) return;

    playUiSound(audioContextRef, "send");
    setMessages((current) => [...current, { role: "user", text: question }]);
    setInput("");
    setIsLoading(true);
    playUiSound(audioContextRef, "thinking");

    try {
      const response = await fetch("/api/dekat-ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: question }),
      });
      const data = (await response.json()) as { reply?: string; error?: string };
      setMessages((current) => [
        ...current,
        { role: "assistant", text: data.reply || data.error || "Coba tanyakan lagi dengan kalimat yang lebih singkat." },
      ]);
      playUiSound(audioContextRef, "done");
    } catch {
      setMessages((current) => [
        ...current,
        { role: "assistant", text: "Koneksi DekatAI sedang terputus. Coba lagi sebentar, ya." },
      ]);
      playUiSound(audioContextRef, "done");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute bottom-[calc(100%+0.75rem)] right-0 flex flex-col items-end gap-3">
      {isOpen ? (
        <section
          className="w-[min(23rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-primary-100 bg-white shadow-[0_22px_70px_rgba(1,34,98,0.2)]"
          aria-label="Percakapan dengan DekatAI"
        >
          <div className="flex items-center justify-between gap-3 bg-primary px-5 py-4 text-white">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-primary">
                <RobotIcon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm font-bold">DekatAI</p>
                <p className="text-[0.65rem] text-primary-100">Asisten DekatLokal</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                playUiSound(audioContextRef, "close");
                setIsOpen(false);
              }}
              className="grid h-8 w-8 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Tutup DekatAI"
            >
              <span aria-hidden="true" className="text-xl leading-none">×</span>
            </button>
          </div>

          <div className="max-h-72 space-y-3 overflow-y-auto bg-[#f8fbff] p-4" aria-live="polite">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-5 ${message.role === "user" ? "rounded-br-md bg-primary text-white" : "rounded-bl-md border border-primary-100 bg-white text-neutral-700"}`}>
                  {message.role === "assistant" ? <RichReply text={message.text} /> : message.text}
                </div>
              </div>
            ))}
            {isLoading ? <p className="text-xs text-neutral-500">DekatAI sedang mengetik…</p> : null}
          </div>

          <form onSubmit={handleSubmit} className="flex touch-manipulation gap-2.5 border-t border-neutral-200 bg-white p-3.5">
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              maxLength={500}
              placeholder="Tanya seputar layanan DekatLokal"
              className="min-w-0 flex-1 touch-manipulation rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-base text-neutral-800 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15"
              aria-label="Pertanyaan untuk DekatAI"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-white transition-all hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-label="Kirim pertanyaan"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                <path d="m4 4 16 8-16 8 3-8-3-8Z" />
                <path d="M7 12h13" />
              </svg>
            </button>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => {
          playUiSound(audioContextRef, isOpen ? "close" : "open");
          setIsOpen((open) => !open);
        }}
        className="group flex h-[60px] min-w-[60px] items-center rounded-full border border-white bg-primary p-2 text-white shadow-[0_8px_26px_rgba(2,85,245,0.35)] transition-all hover:-translate-y-1 hover:bg-primary-600 hover:pr-4 hover:shadow-[0_12px_32px_rgba(2,85,245,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:pr-4"
        aria-label={isOpen ? "Tutup DekatAI" : "Buka DekatAI"}
        aria-expanded={isOpen}
        tabIndex={hidden ? -1 : 0}
      >
        <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-primary">
          <RobotIcon className="icon-hover-motion h-7 w-7" />
        </span>
        <span className="ml-0 max-w-0 overflow-hidden whitespace-nowrap text-xs font-bold tracking-wide opacity-0 transition-[max-width,opacity,margin] duration-300 group-hover:ml-2 group-hover:max-w-24 group-hover:opacity-100 group-focus-visible:ml-2 group-focus-visible:max-w-24 group-focus-visible:opacity-100">
          DekatAI
        </span>
      </button>
    </div>
  );
}
