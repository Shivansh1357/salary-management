import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../test/renderWithProviders.js";
import { EmployeesPage } from "./EmployeesPage.js";

describe("EmployeesPage loading state", () => {
  beforeEach(() => {
    // A fetch that never resolves keeps the query in its loading state.
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("shows skeleton rows (not a bare spinner) while the first page loads", () => {
    renderWithProviders(<EmployeesPage />);
    const skeletonRows = screen.getAllByTestId("employee-skeleton-row");
    expect(skeletonRows.length).toBeGreaterThan(0);
  });
});
