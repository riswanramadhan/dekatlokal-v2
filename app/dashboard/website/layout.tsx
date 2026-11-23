import type { Metadata } from "next";
import "@/app/digital-checkup.css";
import "@/app/commerce.css";
import "./website.css";

export const metadata: Metadata = { title: "Website & AI Admin", robots: { index: false, follow: false } };

export default function WebsiteDashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
