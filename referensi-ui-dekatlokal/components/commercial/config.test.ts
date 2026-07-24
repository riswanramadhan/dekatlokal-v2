import assert from "node:assert/strict";
import test from "node:test";

import { siteConfig, siteRoutes } from "@/lib/site-config";
import {
  WHATSAPP_NUMBER,
  buildWhatsAppUrl,
} from "@/lib/whatsapp";
import {
  WEBSITE_UMKM_SERVICE_PATH,
  commercialLinks,
  commercialNeedOptions,
  customWebsiteConsultationMessage,
  digitalSystemConsultationMessage,
  freeAndProfessionalComparison,
  generalServiceConsultationMessage,
  verifiedTestimonialPlaceholder,
  websiteConsultationMessage,
  websiteServiceFaq,
  websiteServiceFeatures,
  websiteServicePricing,
} from "./config";

function assertWhatsAppUrl(urlValue: string, expectedMessage: string) {
  const url = new URL(urlValue);

  assert.equal(url.origin, "https://wa.me");
  assert.equal(url.pathname, `/${WHATSAPP_NUMBER}`);
  assert.equal(url.searchParams.get("text"), expectedMessage);
  assert.equal(url.hash, "");
}

test("commercial routes and need-selector decisions remain explicit", () => {
  assert.equal(WEBSITE_UMKM_SERVICE_PATH, "/layanan/website-umkm");
  assert.equal(commercialLinks.websiteService, WEBSITE_UMKM_SERVICE_PATH);
  assert.equal(commercialLinks.services, siteRoutes.services);
  assert.equal(
    commercialLinks.websiteCustom,
    siteRoutes.websiteCustomService,
  );
  assert.equal(
    commercialLinks.digitalSystem,
    siteRoutes.digitalSystemService,
  );
  assert.equal(commercialLinks.websiteCustom, "/layanan/website-custom");
  assert.equal(commercialLinks.digitalSystem, "/layanan/sistem-digital");
  assert.equal(commercialLinks.digitalCheckup, siteRoutes.digitalCheckup);
  assert.equal(commercialLinks.digitalCheckupApp, siteConfig.digitalCheckupUrl);
  assert.equal(commercialLinks.portfolio, siteRoutes.websiteUmkm);

  assert.deepEqual(
    commercialNeedOptions.map(({ title, external }) => ({
      title,
      external: external ?? false,
    })),
    [
      { title: "Website UMKM Cepat", external: false },
      { title: "Digital Checkup", external: true },
      { title: "Website Custom", external: false },
      { title: "Sistem Digital", external: false },
    ],
  );
  assert.equal(
    new Set(commercialNeedOptions.map((option) => option.title)).size,
    commercialNeedOptions.length,
  );
  assert.ok(
    commercialNeedOptions.every((option) => option.href.startsWith("/") || option.href.startsWith("https://")),
  );
  assert.ok(
    commercialNeedOptions.every((option) => option.audienceLabel.trim().length > 0),
  );
});

test("published Website UMKM pricing keeps the limited special offer explicit", () => {
  assert.equal(Object.isFrozen(websiteServicePricing), true);
  assert.equal(websiteServicePricing.status, "published");
  assert.equal(websiteServicePricing.startingPrice, 999000);
  assert.equal(websiteServicePricing.normalPrice, 1599000);
  assert.equal(websiteServicePricing.specialPriceLabel, "Harga spesial terbatas");
  assert.strictEqual(websiteServicePricing.included, websiteServiceFeatures);
  assert.ok(websiteServicePricing.timelineLabel.trim().length > 0);
  assert.ok(websiteServicePricing.note.trim().length > 0);

  const pricingFaq = websiteServiceFaq.find((item) =>
    item.question.toLowerCase().includes("harga"),
  );
  assert.ok(pricingFaq);
  assert.match(pricingFaq.answer, /999\.000/);
  assert.match(pricingFaq.answer, /1\.599\.000/);
});

test("consultation links encode the exact WhatsApp messages", () => {
  assert.equal(websiteConsultationMessage.split("\n").length, 4);
  assert.equal(generalServiceConsultationMessage.split("\n").length, 3);
  assertWhatsAppUrl(
    commercialLinks.websiteConsultation,
    websiteConsultationMessage,
  );
  assertWhatsAppUrl(
    commercialLinks.servicesConsultation,
    generalServiceConsultationMessage,
  );
  assertWhatsAppUrl(
    commercialLinks.customWebsiteConsultation,
    customWebsiteConsultationMessage,
  );
  assertWhatsAppUrl(
    commercialLinks.digitalSystemConsultation,
    digitalSystemConsultationMessage,
  );

  const punctuationMessage = "Halo & tes\nBaris kedua";
  assertWhatsAppUrl(buildWhatsAppUrl(punctuationMessage), punctuationMessage);
});

test("free and professional paths remain distinct with direct CTAs", () => {
  assert.deepEqual(
    freeAndProfessionalComparison.map((item) => item.title),
    ["Program website gratis", "Layanan profesional"],
  );
  assert.ok(
    freeAndProfessionalComparison.every(
      (item) => item.description.trim() && item.items.length >= 4,
    ),
  );
  assert.equal(freeAndProfessionalComparison[0].href, commercialLinks.digitalCheckupApp);
  assert.equal(freeAndProfessionalComparison[0].external, true);
  assert.equal(freeAndProfessionalComparison[0].ctaLabel, "Dapatkan web gratis");
  assert.equal(verifiedTestimonialPlaceholder.href, commercialLinks.portfolio);
  assert.doesNotMatch(verifiedTestimonialPlaceholder.title, /placeholder|disiapkan/i);
  assert.doesNotMatch(verifiedTestimonialPlaceholder.description, /placeholder|disiapkan/i);
});
