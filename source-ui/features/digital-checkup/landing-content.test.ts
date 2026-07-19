import assert from "node:assert/strict";
import test from "node:test";

import { questionGroups } from "@/components/assessment/data";
import {
  digitalCheckupAspects,
  digitalCheckupBenefits,
  digitalCheckupFaq,
  digitalCheckupSteps,
} from "./landing-content";

function assertUniqueNonEmptyContent(
  items: readonly { title: string; description: string }[],
) {
  assert.equal(new Set(items.map((item) => item.title)).size, items.length);

  for (const item of items) {
    assert.ok(item.title.trim().length > 0);
    assert.ok(item.description.trim().length > 0);
  }
}

test("landing presents exactly the eight assessment aspects", () => {
  assert.equal(questionGroups.length, 8);
  assert.equal(digitalCheckupAspects.length, 8);
  assert.deepEqual(
    questionGroups.map((group) => group.id),
    [
      "identity",
      "legality",
      "product",
      "branding",
      "digitalization",
      "consistency",
      "operations",
      "commitment",
    ],
  );
  assert.deepEqual(
    digitalCheckupAspects.map((aspect) => aspect.title),
    [
      "Identitas",
      "Legalitas",
      "Produk",
      "Branding",
      "Jejak Digital",
      "Konsistensi",
      "Operasional",
      "Komitmen",
    ],
  );
  assertUniqueNonEmptyContent(digitalCheckupAspects);
});

test("benefits and process steps remain complete and non-duplicated", () => {
  assert.equal(digitalCheckupBenefits.length, 3);
  assert.equal(digitalCheckupSteps.length, 3);
  assertUniqueNonEmptyContent(digitalCheckupBenefits);
  assertUniqueNonEmptyContent(digitalCheckupSteps);
});

test("FAQ entries are unique and include the free website program", () => {
  assert.equal(
    new Set(digitalCheckupFaq.map((item) => item.question)).size,
    digitalCheckupFaq.length,
  );

  for (const item of digitalCheckupFaq) {
    assert.ok(item.question.trim().length > 0);
    assert.ok(item.answer.trim().length > 0);
  }

  const freeWebsiteFaq = digitalCheckupFaq.find((item) =>
    item.question.toLowerCase().includes("website gratis"),
  );
  assert.ok(freeWebsiteFaq);
  assert.match(freeWebsiteFaq.answer, /program dampak sosial/i);
  assert.match(freeWebsiteFaq.answer, /Digital Checkup/i);
});
