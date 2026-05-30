import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../test/renderWithProviders.js";
import { EmployeeFormModal } from "./EmployeeFormModal.js";

describe("EmployeeFormModal", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("shows validation errors and does not call the API on invalid submit", async () => {
    const user = userEvent.setup();
    renderWithProviders(<EmployeeFormModal opened onClose={() => {}} />);

    // First name, last name, email, job title and salary are empty/invalid.
    await user.click(screen.getByRole("button", { name: /add employee/i }));

    expect(await screen.findByText("First name is required")).toBeInTheDocument();
    expect(screen.getByText("A valid email is required")).toBeInTheDocument();
    expect(screen.getByText("Salary must be greater than 0")).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("submits to the API when the form is valid", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: "new-id" }),
    });
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<EmployeeFormModal opened onClose={onClose} />);

    await user.type(screen.getByLabelText(/first name/i), "Ada");
    await user.type(screen.getByLabelText(/last name/i), "Lovelace");
    await user.type(screen.getByLabelText(/email/i), "ada@acme.test");
    await user.type(screen.getByLabelText(/job title/i), "Engineer");
    await user.type(screen.getByLabelText(/annual base salary/i), "120000");

    await user.click(screen.getByRole("button", { name: /add employee/i }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]!;
    expect(String(url)).toMatch(/\/api\/employees$/);
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.email).toBe("ada@acme.test");
    expect(body.baseSalary).toBe(120_000_00); // major → minor units
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });
});
