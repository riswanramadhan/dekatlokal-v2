import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { CATEGORY_IDS } from "@/lib/sites/categories";
import { SAMPLE_CONTENT } from "@/lib/sites/samples";
import { formatPrice } from "@/lib/sites/schema";
import { TEMPLATES } from "@/lib/sites/templates";

// next/font hanya bisa dijalankan oleh compiler Next; di test cukup nama kelas tiruan.
vi.mock("@/components/sites/fonts", () => ({ TEMPLATE_FONTS: { warung: "f-w", etalase: "f-e", studio: "f-s", pasar: "f-p", kriya: "f-k", kelas: "f-l" } }));
const { SiteTemplate } = await import("@/components/sites/site-template");

const render = (template: (typeof TEMPLATES)[number]["code"], content: (typeof SAMPLE_CONTENT)["kuliner"], mode: "live" | "preview" | "thumb" = "live") =>
  renderToStaticMarkup(createElement(SiteTemplate, { template, content, mode }));

describe("template website dirender lengkap", () => {
  it.each(TEMPLATES.map((t) => t.code))("%s: semua kategori contoh tampil dengan harga, tombol WhatsApp, dan jam buka", (code) => {
    for (const category of CATEGORY_IDS) {
      const content = { ...SAMPLE_CONTENT[category], whatsapp: "081234567890" };
      const html = render(code, content);
      expect(html, `${code}/${category}`).toContain(content.businessName.replace(/&/g, "&amp;"));
      for (const product of content.products) expect(html, `${code}/${category}`).toContain(formatPrice(product.price));
      expect(html).toContain("https://wa.me/6281234567890");
      expect(html).toContain("data-site-order");
      expect(html).toContain(content.hours[0].time);
      expect(html).toMatch(/<h1[\s>]/);
      expect(html).not.toMatch(/undefined|NaN|\[object Object\]/);
    }
  });

  it.each(TEMPLATES.map((t) => t.code))("%s: tetap rapi saat isi minimum dan tanpa WhatsApp/foto", (code) => {
    const minimal = { ...SAMPLE_CONTENT.toko, whatsapp: "", heroImage: "", about: "", tagline: "", products: [], services: [], testimonials: [], faq: [], hours: [], address: "", instagram: "", tiktok: "", googleMaps: "", cta: "" };
    const html = render(code, minimal);
    expect(html).toContain("Toko Sinar Pagi");
    expect(html).toContain('href="#kontak"');
    expect(html).toContain("Jam buka belum dicantumkan");
    expect(html).not.toMatch(/undefined|NaN/);
  });

  it("kartu galeri tanpa tombol sticky dan tanpa id ganda", () => {
    const html = render("warung", { ...SAMPLE_CONTENT.kuliner }, "thumb");
    expect(html).not.toContain("data-site-order");
    expect(html).not.toMatch(/ id="/);
  });
});
