"use client";

import { useEffect, useRef, useState } from "react";
import { buildWhatsAppUrl } from "@/lib/ecosystem/links";

const WHATSAPP_MESSAGE = "Halo DekatLokal, saya mau tanya soal Digital Checkup.";
const WHATSAPP_URL = buildWhatsAppUrl(WHATSAPP_MESSAGE);

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/**
 * Tumpukan tombol mengambang di pojok kanan bawah: DekatAI di atas, WhatsApp di bawah.
 * Posisi, ukuran, dan efek hover diatur oleh kelas .fab-* di app/globals.css.
 * Tumpukan disembunyikan saat footer mencapai area tombol agar tidak menutupi tautan footer.
 */
export default function EcosystemWhatsAppFAB() {
  const [isHiddenAtFooter, setIsHiddenAtFooter] = useState(false);
  const stackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const footer = document.querySelector("footer");
      const stack = stackRef.current;
      if (!footer || !stack) return;

      // Pakai posisi tanpa transform (bottom dari CSS) agar tidak berkedip saat animasi sembunyi.
      const styles = window.getComputedStyle(stack);
      const stackBottom = window.innerHeight - Number.parseFloat(styles.bottom || "0");
      // offsetHeight mengabaikan transform dan mengikuti ukuran font root pengguna.
      const buttonSize = (stack.lastElementChild as HTMLElement | null)?.offsetHeight || 56;
      const footerTop = footer.getBoundingClientRect().top;
      // Halaman pendek (footer sudah terlihat tanpa scroll) tidak boleh menyembunyikan tombol selamanya.
      const canScroll = document.documentElement.scrollHeight - window.innerHeight > buttonSize;

      setIsHiddenAtFooter(canScroll && footerTop < stackBottom - buttonSize * 0.5);
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    // Tinggi halaman bisa berubah tanpa scroll (FAQ dibuka, gambar dimuat, splash selesai).
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    update();

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <div
      ref={stackRef}
      className="fab-stack"
      data-hidden={isHiddenAtFooter ? "true" : "false"}
      aria-hidden={isHiddenAtFooter}
      inert={isHiddenAtFooter}
    >
      <div className="fab-item">
        <span className="fab-label" aria-hidden="true">
          Chat tim via WhatsApp
        </span>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat tim via WhatsApp (buka di tab baru)"
          tabIndex={isHiddenAtFooter ? -1 : 0}
          className="fab-button fab-button--wa"
        >
          <WhatsAppIcon className="fab-icon" />
        </a>
      </div>
    </div>
  );
}
