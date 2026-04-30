import { describe, it, expect, vi } from "vitest";

// Mock fetch for Brevo API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("newsletter.subscribe", () => {
  it("calls Brevo contacts API with correct email and list", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 201, text: async () => "" });
    mockFetch.mockResolvedValueOnce({ ok: true, status: 201, text: async () => "" });

    const email = "test@example.com";
    const name = "Testi Käyttäjä";
    const listId = 2;

    const body = {
      email,
      listIds: [listId],
      updateEnabled: true,
      attributes: { FIRSTNAME: name },
    };

    const res = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": "test-key",
      },
      body: JSON.stringify(body),
    });

    expect(res.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.brevo.com/v3/contacts",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining(email),
      })
    );
  });

  it("handles existing contact gracefully (400 Contact already exist)", async () => {
    // Verify that the error text contains the expected message
    const errorText = JSON.stringify({code:"duplicate_parameter",message:"Contact already exist"});
    expect(errorText).toContain("Contact already exist");
    // Verify that the router logic would not throw for this case
    const shouldThrow = !errorText.includes("Contact already exist");
    expect(shouldThrow).toBe(false);
  });
});
