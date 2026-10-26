import type { Express } from "express";
import { processCoverSyncBatch } from "./sync";
import { parseJourneyLists } from "../../shared/cover-journey";
import { CoverVault, VaultCrypto, MysqlVault } from "./vault";
import { registerCoverRoutes, type AccessMail } from "./routes";
export async function configureCover(app: Express) {
  const base = "https://www.thunderkustannus.fi";
  if (process.env.COVER_ENABLED !== "true") {
    registerCoverRoutes(app, { base, vault: null, sendAccess: null });
    return;
  }
  const key = process.env.COVER_VAULT_KEY || "";
  if (!/^[a-f0-9]{64}$/i.test(key) || !process.env.DATABASE_URL) {
    console.error("[Cover] Private storage configuration incomplete");
    registerCoverRoutes(app, { base, vault: null, sendAccess: null });
    return;
  }
  try {
    const repo = new MysqlVault(process.env.DATABASE_URL);
    await repo.init();
    const cleanup = setInterval(() => {
      void repo
        .prune(Date.now())
        .catch(() => console.error("[Cover] Retention cleanup pending"));
    }, 3600000);
    cleanup.unref();
    const vault = new CoverVault(
      repo,
      new VaultCrypto(Buffer.from(key, "hex"))
    );
    if (process.env.COVER_SYNC_ENABLED === "true") {
      if (!process.env.BREVO_API_KEY || !process.env.COVER_BREVO_LISTS)
        throw Error("Cover sync configuration incomplete");
      const lists = parseJourneyLists(
        JSON.parse(process.env.COVER_BREVO_LISTS)
      );
      let syncing = false;
      const syncTimer = setInterval(async () => {
        if (syncing) return;
        syncing = true;
        try {
          await processCoverSyncBatch(vault, repo, {
            apiKey: process.env.BREVO_API_KEY!,
            lists,
          });
        } catch {
          console.error("[Cover] Journey synchronization unavailable");
        } finally {
          syncing = false;
        }
      }, 30000);
      syncTimer.unref();
    }
    const sendAccess =
      process.env.COVER_ACCESS_EMAIL_ENABLED === "true" &&
      process.env.BREVO_API_KEY
        ? async (mail: AccessMail) => {
            const safe = mail.url
              .replace(/&/g, "&amp;")
              .replace(/"/g, "&quot;");
            const response = await fetch(
              "https://api.brevo.com/v3/smtp/email",
              {
                method: "POST",
                signal: AbortSignal.timeout(10000),
                headers: {
                  "api-key": process.env.BREVO_API_KEY!,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  sender: {
                    email: "info@thunderkustannus.fi",
                    name: "Thunder Kustannus",
                  },
                  to: [{ email: mail.email }],
                  subject: "Käyttölinkkisi Thunderin kansisuunnittelijaan",
                  textContent:
                    "Avaa oma kansiprojektisi henkilökohtaisesta käyttölinkistä: " +
                    mail.url +
                    "\n\nLinkki on voimassa 15 minuuttia ja toimii kerran. Jos et pyytänyt linkkiä, voit jättää viestin huomiotta.\n\nThunder Kustannus",
                  htmlContent:
                    '<div style="font:18px Arial;line-height:1.7;color:#253c34;max-width:600px;padding:24px"><h1>Avaa oma kansiprojektisi</h1><p>Vahvista sähköpostiosoitteesi ja jatka kansisuunnitteluun.</p><a style="display:inline-block;padding:16px;background:#c64600;color:#fff;text-decoration:none" href="' +
                    safe +
                    '">Avaa kansisuunnittelija</a><p>Linkki on henkilökohtainen, voimassa 15 minuuttia ja toimii kerran. Jos et pyytänyt sitä, voit jättää viestin huomiotta.</p><p>Thunder Kustannus</p></div>',
                  tags: ["cover-access"],
                  // Verify Brevo link delivery/tracking before enabling access email.
                }),
              }
            );
            if (!response.ok) throw Error("Access delivery unavailable");
          }
        : null;
    const profile = {
      id: process.env.COVER_PRESS_PROFILE || "cmyk-standard",
      icc: process.env.COVER_PRESS_ICC_PATH || "cmyk",
      conversionConfigured: true,
      maxInkPercent: Number(process.env.COVER_PRESS_INK_LIMIT || 400),
      minimumImageDpi: 300,
    };
    const prepress = {
      inspect: async (project: unknown, confirmed: boolean) => {
        const { inspectCover } = await import("./prepress");
        const p = project as { production: { pages: number } };
        return (
          await inspectCover(project, profile, {
            interiorPageCount: confirmed ? p.production.pages : undefined,
          })
        ).report;
      },
      export: async (
        project: unknown,
        options: { confirmed: boolean; fingerprint?: string; proof: boolean }
      ) => {
        const { exportPressCover } = await import("./prepress");
        const p = project as { production: { pages: number } };
        return exportPressCover(project, profile, {
          interiorPageCount: options.confirmed ? p.production.pages : undefined,
          acknowledgedFingerprint: options.fingerprint,
          proof: options.proof,
        });
      },
    };
    registerCoverRoutes(app, { base, vault, sendAccess, prepress });
  } catch {
    console.error("[Cover] Private storage setup unavailable");
    registerCoverRoutes(app, { base, vault: null, sendAccess: null });
  }
}
