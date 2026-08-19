import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const signInWithOtp = vi.fn();
const verifyOtp = vi.fn();

vi.mock("./lib/supabase", () => ({
  supabase: { auth: { signInWithOtp, verifyOtp } },
}));

import { SignIn } from "./App";

describe("passwordless sign in", () => {
  beforeEach(() => {
    signInWithOtp.mockReset().mockResolvedValue({ error: null });
    verifyOtp.mockReset().mockResolvedValue({ error: null });
  });

  it("requests invite-only sign-in options", async () => {
    render(<SignIn />);
    fireEvent.change(screen.getByLabelText("Work email"), { target: { value: " TEST@BulkGSM.com " } });
    fireEvent.click(screen.getByRole("button", { name: "Email my sign-in options" }));

    await waitFor(() => expect(signInWithOtp).toHaveBeenCalledWith({
      email: "test@bulkgsm.com",
      options: { emailRedirectTo: window.location.origin, shouldCreateUser: false },
    }));
    expect(await screen.findByLabelText("Email one-time code")).toBeInTheDocument();
  });

  it("verifies the configured eight-digit email OTP", async () => {
    render(<SignIn />);
    fireEvent.change(screen.getByLabelText("Work email"), { target: { value: "test@bulkgsm.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Email my sign-in options" }));
    const code = await screen.findByLabelText("Email one-time code");
    fireEvent.change(code, { target: { value: "12345678" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in with code" }));

    await waitFor(() => expect(verifyOtp).toHaveBeenCalledWith({
      email: "test@bulkgsm.com",
      token: "12345678",
      type: "email",
    }));
  });
});
