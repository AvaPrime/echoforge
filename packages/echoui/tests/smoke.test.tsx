import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { Button } from ".."; // from public entrypoint once exports set

describe("EchoUI", () => {
  it("renders a Button", () => {
    render(<Button>Click</Button>);
    expect(screen.getByRole("button", { name: "Click" })).toBeTruthy();
  });
});