// @vitest-environment jsdom
import { createElement } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { buildModel, DIMENSIONS, instrument, MODULES, PAIRS, topsis, type ExpertInput } from "@/lib/decision-engine";
import { RUN_STEPS, MODEL_STEPS } from "@/lib/digital-checkup/labels";
import { RunSteps } from "@/components/admin/run-steps";
import { ModelSteps } from "@/components/admin/model-steps";
vi.mock("next/link", () => ({ default: (props: { href: string; children: unknown; className?: string }) => createElement("a", { href: props.href, className: props.className }, props.children as string) }));
afterEach(cleanup);

const answers = Object.fromEntries(instrument.questions.map((q) => [q.code, 2]));
const expert = (variant = 0): ExpertInput => ({ pairs: PAIRS.map((p) => ({ ...p, preferred: variant && p.left === "C1" ? p.left : "equal", intensity: variant && p.left === "C1" ? variant + 1 : 1 })), relevance: Object.fromEntries(MODULES.map((m, i) => [m, Object.fromEntries(DIMENSIONS.map((d, j) => [d, (i + j + variant) % 5]))])) });
const model = buildModel([expert(), expert(1), expert(2)]);

it("RunSteps renders all ten numbered steps as tables, never as JSON", () => {
  const trace = topsis(answers, model.w, model.R);
  const { container } = render(createElement(RunSteps, { trace, answers, modelHref: "/admin/ahli#model-x" }));
  const headings = Array.from(container.querySelectorAll("h3")).map((h) => h.textContent);
  for (const step of RUN_STEPS) expect(headings).toContain(step.title);
  expect(screen.getAllByText(/Nilai kedekatan/).length).toBeGreaterThan(0);
  expect(container.textContent).not.toContain('{"w":');
  expect(container.textContent).not.toMatch(/"S":\s*\[/);
  expect(container.querySelectorAll("table").length).toBeGreaterThanOrEqual(10);
  expect(container.querySelectorAll(".adm-row-top").length).toBe(trace.topSet.length);
  expect(container.querySelector('a[href="/admin/ahli#model-x"]')).toBeTruthy();
});

it("RunSteps shows formulas on demand and stops at the last computed step for a run without gaps", () => {
  const perfect = topsis(Object.fromEntries(instrument.questions.map((q) => [q.code, 4])), model.w, model.R);
  const { container } = render(createElement(RunSteps, { trace: perfect }));
  expect(container.querySelectorAll("code.adm-formula").length).toBe(0);
  fireEvent.click(screen.getByLabelText("Lihat rumus"));
  expect(container.querySelectorAll("code.adm-formula").length).toBeGreaterThan(0);
  expect(screen.getByText("Tidak ada kekurangan")).toBeTruthy();
  expect(container.querySelector(".adm-step-stop")).toBeTruthy();
  expect(container.querySelectorAll(".adm-step-skip").length).toBe(6);
});

it("ModelSteps renders eight steps and one consistency chip per expert", () => {
  const { container } = render(createElement(ModelSteps, { model, expertNames: ["Ayu", "Asluddin", "Rizky"] }));
  const headings = Array.from(container.querySelectorAll("h3")).map((h) => h.textContent);
  for (const step of MODEL_STEPS) expect(headings).toContain(step.title);
  expect(screen.getAllByText("Konsisten ≤ 0,10")).toHaveLength(3);
  expect(screen.getByText("Gabungan konsisten")).toBeTruthy();
  expect(container.textContent).not.toContain('"crisp"');
  const tabs = screen.getAllByText("Rizky").filter((node) => node.tagName === "BUTTON");
  expect(tabs.length).toBeGreaterThan(0);
  fireEvent.click(tabs[0]);
  expect(tabs[0]).toHaveAttribute("aria-pressed", "true");
  // The pairwise table shows ratios such as 3 and 1/3, not decimals.
  expect(container.textContent).toContain("1/3");
});
