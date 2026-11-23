import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function WebsiteTopbar({ back = { href: "/dashboard", label: "Dashboard" } }: { back?: { href: string; label: string } }) {
  return <header className="dc-topbar">
    <Link href="/dashboard"><Image src="/brand/dekat-lokal.png" alt="DekatLokal" width={143} height={44} /></Link>
    <span>Website gratis & AI Admin</span>
    <Link className="sb-back" href={back.href}><ArrowLeft size={15} aria-hidden="true" />{back.label}</Link>
  </header>;
}
