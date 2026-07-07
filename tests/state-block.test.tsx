import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StateBlock } from "@/components/ui";

describe("StateBlock", () => {
  it("renders an accessible locked state", () => {
    render(
      <StateBlock
        description="Selesaikan langkah sebelumnya sebelum memulai modul ini."
        kind="locked"
        title="Modul terkunci"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Modul terkunci" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Selesaikan langkah sebelumnya sebelum memulai modul ini."),
    ).toBeInTheDocument();
  });
});
