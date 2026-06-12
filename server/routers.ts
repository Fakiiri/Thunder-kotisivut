import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
const BREVO_API_KEY = process.env.BREVO_API_KEY || "";

// notifyOwner replaced with Brevo email for Railway compatibility
async function notifyOwnerByEmail(title: string, content: string): Promise<void> {
  if (!BREVO_API_KEY) return;
  try {
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": BREVO_API_KEY },
      body: JSON.stringify({
        sender: { name: "Thunder Kustannus", email: "info@thunderkustannus.fi" },
        to: [{ email: "info@thunderkustannus.fi", name: "Thunder Kustannus" }],
        subject: title,
        textContent: content,
      }),
    });
  } catch (e) {
    console.error("Owner notification failed:", e);
  }
}
const BREVO_LIST_ID = parseInt(process.env.BREVO_LIST_ID || "2");
const PDF_DOWNLOAD_URL = "https://thunderkustannus.fi/downloads/opas.pdf";

async function addContactToBrevo(email: string, name?: string): Promise<void> {
  const body: Record<string, unknown> = {
    email,
    listIds: [BREVO_LIST_ID],
    updateEnabled: true,
  };

  if (name) {
    body.attributes = { FIRSTNAME: name };
  }

  const res = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": BREVO_API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok && res.status !== 204) {
    const text = await res.text();
    // 400 with "Contact already exist" is fine
    if (!text.includes("Contact already exist")) {
      throw new Error(`Brevo error: ${res.status} ${text}`);
    }
  }
}

async function sendPDFEmail(email: string, name?: string): Promise<void> {
  const firstName = name || "Hei";
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: "Thunder Kustannus", email: "info@thunderkustannus.fi" },
      to: [{ email, name: name || email }],
      subject: "Tässä on ilmainen oppaasi: Kirjan julkaisemisen tarkistuslista",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a;">
          <div style="background: #0f0f0f; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
            <h1 style="color: #f97316; font-size: 24px; margin: 0 0 8px;">Thunder Kustannus</h1>
            <p style="color: rgba(255,255,255,0.6); margin: 0; font-size: 14px;">thunderkustannus.fi</p>
          </div>

          <p style="font-size: 16px; line-height: 1.6;">Hei ${firstName},</p>

          <p style="font-size: 15px; line-height: 1.7; color: #444;">
            Kiitos kiinnostuksestasi! Tässä on lupaamamme ilmainen opas:
          </p>

          <div style="background: #fff7ed; border-left: 4px solid #f97316; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 24px 0;">
            <h2 style="color: #0f0f0f; font-size: 18px; margin: 0 0 8px;">Kirjan julkaisemisen 10 askeleen tarkistuslista</h2>
            <p style="color: #666; font-size: 14px; margin: 0 0 16px;">PDF-opas · 10 askelta · Ilmainen</p>
            <a href="${PDF_DOWNLOAD_URL}" style="background: #f97316; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
              Lataa PDF-opas
            </a>
          </div>

          <p style="font-size: 14px; line-height: 1.7; color: #666;">
            Opas kattaa kaiken ISBN-tunnuksesta jakelukanaviin ja markkinointiin. Tulosta se, laita seinälle ja ruksaa askeleet sitä mukaa kun ne valmistuvat.
          </p>

          <p style="font-size: 14px; line-height: 1.7; color: #666;">
            Jos sinulla on kysyttävää kirjan julkaisemisesta, vastaamme mielellämme osoitteessa 
            <a href="mailto:info@thunderkustannus.fi" style="color: #f97316;">info@thunderkustannus.fi</a>.
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

          <p style="font-size: 12px; color: #999; line-height: 1.6;">
            Thunder Kustannus · thunderkustannus.fi<br/>
            Sait tämän viestin koska tilasit ilmaisen oppaan sivustoltamme.<br/>
            <a href="https://thunderkustannus.fi" style="color: #999;">Peruuta tilaus</a>
          </p>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Brevo email error: ${res.status} ${text}`);
  }
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  newsletter: router({
    subscribe: publicProcedure
      .input(z.object({
        email: z.string().email("Virheellinen sähköpostiosoite"),
        name: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { email, name } = input;

        // 1. Lisää Brevoon
        await addContactToBrevo(email, name);

        // 2. Lähetä PDF sähköpostilla
        await sendPDFEmail(email, name);

        // 3. Ilmoita omistajalle uudesta liidistä
        await notifyOwnerByEmail(
          "Uusi liidi: Opas ladattu",
          `${name ? name + " (" + email + ")" : email} latasi kirjan julkaisemisen oppaan.`
        );

        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
