// @vitest-environment jsdom
import { createElement } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { DimensionAnalysis } from "@/components/digital-checkup/dimension-analysis";
import { instrument } from "@/lib/decision-engine";

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
});

afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });

it("menganalisis delapan dimensi berurutan lalu membuka tinjauan", () => {
  const done = vi.fn();
  const answers = Object.fromEntries(instrument.questions.map((question) => [question.code, 2]));
  render(createElement(DimensionAnalysis, { answers, onComplete: done }));
  expect(screen.getByRole("heading", { name: "Profil usaha" })).toBeTruthy();
  expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("50");
  for (let index = 1; index < instrument.dimensions.length; index += 1) act(() => vi.advanceTimersByTime(320));
  expect(screen.getByRole("heading", { name: "Komitmen" })).toBeTruthy();
  act(() => vi.advanceTimersByTime(320));
  expect(done).toHaveBeenCalledTimes(1);
});

it("bisa langsung menuju tinjauan tanpa menunggu animasi", () => {
  const done = vi.fn();
  const answers = Object.fromEntries(instrument.questions.map((question) => [question.code, 0]));
  render(createElement(DimensionAnalysis, { answers, onComplete: done }));
  fireEvent.click(screen.getByRole("button", { name: "Lihat tinjauan jawaban" }));
  expect(done).toHaveBeenCalledTimes(1);
});
