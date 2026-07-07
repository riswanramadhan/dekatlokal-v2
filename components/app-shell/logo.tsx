import Image from "next/image";
import Link from "next/link";

export function BrandLogo({ href = "/app/beranda" }: { href?: string }) {
  return (
    <Link
      aria-label="Ke Ruang Tumbuh DekatLokal"
      className="inline-flex items-center"
      href={href}
    >
      <Image
        alt="DekatLokal"
        height={41}
        priority
        src="/brand/dekat-lokal.png"
        width={132}
      />
    </Link>
  );
}

export function BrandMark({ href = "/app/beranda" }: { href?: string }) {
  return (
    <Link
      aria-label="Ke Ruang Tumbuh DekatLokal"
      className="inline-flex h-12 w-12 items-center justify-center rounded-[20px] bg-white shadow-[var(--shadow-soft)]"
      href={href}
    >
      <Image
        alt="DekatLokal"
        height={32}
        priority
        src="/brand/dekat-lokal-icon.png"
        width={32}
      />
    </Link>
  );
}
