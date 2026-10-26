import express, { type Express, type Request } from "express";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { CoverVault } from "./vault";
export type AccessMail = { email: string; url: string };
export type CoverRouteOptions = {
  prepress?: {
    inspect: (project: unknown, confirmed: boolean) => Promise<unknown>;
    export: (
      project: unknown,
      options: { confirmed: boolean; fingerprint?: string; proof: boolean }
    ) => Promise<{ pdf: Buffer }>;
  };
  base: string;
  vault: CoverVault | null;
  sendAccess: ((mail: AccessMail) => Promise<void>) | null;
};
const emailSchema = z.string().trim().toLowerCase().email().max(254);
const requestSchema = z.object({
  email: emailSchema,
  marketing: z.boolean(),
  website: z.string().max(100).default(""),
});
const verifySchema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/),
  email: emailSchema,
});
const saveSchema = z.object({
  project: z.unknown(),
  id: z.string().uuid().optional(),
  revision: z.number().int().min(0).max(1000000).default(0),
});
export function registerCoverRoutes(app: Express, config: CoverRouteOptions) {
  const secure = new URL(config.base).protocol === "https:",
    cookieName = secure ? "__Host-thunder_cover" : "thunder_cover_dev";
  const token = (req: Request) => {
    const value =
      (req.headers.cookie || "")
        .split(";")
        .map(v => v.trim())
        .find(v => v.startsWith(cookieName + "="))
        ?.slice(cookieName.length + 1) || "";
    return /^[a-f0-9]{64}$/.test(value) ? value : "";
  };
  const router = express.Router();
  router.use((req, res, next) => {
    res.set({
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
      "X-Robots-Tag": "noindex",
    });
    if (
      req.method !== "GET" &&
      req.headers.origin !== new URL(config.base).origin
    ) {
      res.sendStatus(403);
      return;
    }
    next();
  });
  router.get("/status", (_req, res) =>
    res.json({
      available: !!config.vault,
      loginEnabled: !!config.sendAccess,
      maxProjects: 5,
      maxImageMB: 12,
    })
  );
  router.post(
    "/access/request",
    express.json({ limit: "2kb" }),
    async (req, res) => {
      try {
        if (!config.vault || !config.sendAccess) {
          res
            .status(503)
            .json({ error: "Sähköpostikirjautuminen ei ole vielä käytössä." });
          return;
        }
        const input = requestSchema.safeParse(req.body);
        if (!input.success || input.data.website) {
          res.status(400).json({ error: "Tarkista sähköpostiosoite." });
          return;
        }
        const key = await config.vault.requestLink(
          input.data.email,
          input.data.marketing,
          req.socket.remoteAddress || "unknown"
        );
        if (key)
          await config.sendAccess({
            email: input.data.email,
            url: config.base + "/kansi-kirjaudu#token=" + key,
          });
        res.status(202).json({ accepted: true });
      } catch {
        res.status(503).json({
          error: "Käyttölinkkiä ei voitu toimittaa. Yritä myöhemmin.",
        });
      }
    }
  );
  router.post(
    "/access/verify",
    express.json({ limit: "2kb" }),
    async (req, res) => {
      try {
        if (!config.vault) {
          res.sendStatus(503);
          return;
        }
        if (
          !(await config.vault.throttle(
            req.socket.remoteAddress || "unknown",
            "verify"
          ))
        ) {
          res.sendStatus(429);
          return;
        }
        const input = verifySchema.safeParse(req.body);
        if (!input.success) {
          res.sendStatus(400);
          return;
        }
        const access = await config.vault.verify(
          input.data.token,
          input.data.email
        );
        if (!access) {
          res.status(401).json({
            error:
              "Linkki on käytetty, vanhentunut tai osoite ei täsmää. Pyydä uusi käyttölinkki.",
          });
          return;
        }
        res.cookie(cookieName, access.session, {
          httpOnly: true,
          secure,
          sameSite: "lax",
          path: "/",
          maxAge: 30 * 86400000,
        });
        res.json({ verified: true, email: access.email });
      } catch {
        res.sendStatus(503);
      }
    }
  );
  router.get("/session", async (req, res) => {
    try {
      const user = await config.vault?.identity(token(req));
      res.json(
        user
          ? { authenticated: true, email: user.email }
          : { authenticated: false }
      );
    } catch {
      res.sendStatus(503);
    }
  });
  router.post("/logout", async (req, res) => {
    try {
      await config.vault?.logout(token(req));
      res.clearCookie(cookieName, {
        httpOnly: true,
        secure,
        sameSite: "lax",
        path: "/",
      });
      res.sendStatus(204);
    } catch {
      res.sendStatus(503);
    }
  });
  router.use("/projects", async (req, res, next) => {
    try {
      if (!config.vault) {
        res.sendStatus(503);
        return;
      }
      if (!(await config.vault.identity(token(req)))) {
        res.sendStatus(401);
        return;
      }
      next();
    } catch {
      res.sendStatus(503);
    }
  });
  router.get("/projects", async (req, res) => {
    try {
      res.json({ projects: await config.vault!.projects(token(req)) });
    } catch {
      res.sendStatus(503);
    }
  });
  router.get("/projects/:id", async (req, res) => {
    try {
      if (!z.string().uuid().safeParse(req.params.id).success) {
        res.sendStatus(404);
        return;
      }
      const p = await config.vault!.getProject(token(req), req.params.id);
      p ? res.json(p) : res.sendStatus(404);
    } catch {
      res.sendStatus(503);
    }
  });
  router.post(
    "/projects/:id/ready",
    express.json({ limit: "2kb" }),
    async (req, res) => {
      const input = z
        .object({ fingerprint: z.string().regex(/^[a-f0-9]{64}$/) })
        .safeParse(req.body);
      if (
        !input.success ||
        !z.string().uuid().safeParse(req.params.id).success
      ) {
        res.sendStatus(400);
        return;
      }
      try {
        await config.vault!.markReady(
          token(req),
          req.params.id,
          input.data.fingerprint
        );
        res.json({ ready: true });
      } catch (e) {
        const reason = e instanceof Error ? e.message : "";
        res
          .status(
            reason === "not-found" ? 404 : reason === "conflict" ? 409 : 503
          )
          .json({
            error:
              reason === "conflict"
                ? "Tallenna ja tarkista uusin kansiversio ennen valmiiksi merkitsemistä."
                : "Valmiiksi merkitseminen ei onnistunut.",
          });
      }
    }
  );
  let prepressBusy = false;
  router.post(
    "/projects/:id/preflight",
    express.json({ limit: "2kb" }),
    async (req, res) => {
      try {
        if (!config.prepress) {
          res.sendStatus(503);
          return;
        }
        const saved = await config.vault!.getProject(
          token(req),
          String(req.params.id)
        );
        if (!saved) {
          res.sendStatus(404);
          return;
        }
        if (prepressBusy) {
          res.sendStatus(429);
          return;
        }
        // Claim synchronously before awaiting shared quotas.
        prepressBusy = true;
        try {
          if (
            !(await config.vault!.throttle(saved.id, "preflight", 20)) ||
            !(await config.vault!.throttle("all", "press-global", 20))
          ) {
            res.sendStatus(429);
            return;
          }
          res.json(
            await config.prepress.inspect(
              saved.project,
              req.body.confirmed === true
            )
          );
        } finally {
          prepressBusy = false;
        }
      } catch {
        res
          .status(503)
          .json({ error: "Painoaineiston tarkistus ei onnistunut." });
      }
    }
  );
  router.post(
    "/projects/:id/export",
    express.json({ limit: "2kb" }),
    async (req, res) => {
      try {
        if (!config.prepress) {
          res.sendStatus(503);
          return;
        }
        const saved = await config.vault!.getProject(
          token(req),
          String(req.params.id)
        );
        if (!saved) {
          res.sendStatus(404);
          return;
        }
        if (prepressBusy) {
          res.sendStatus(429);
          return;
        }
        // Claim synchronously before awaiting shared quotas.
        prepressBusy = true;
        try {
          if (
            !(await config.vault!.throttle(saved.id, "export", 3)) ||
            !(await config.vault!.throttle("all", "press-global", 20))
          ) {
            res.sendStatus(429);
            return;
          }
          const output = await config.prepress.export(saved.project, {
            confirmed: req.body.confirmed === true,
            fingerprint:
              typeof req.body.fingerprint === "string"
                ? req.body.fingerprint
                : undefined,
            proof: req.body.proof === true,
          });
          res
            .type("application/pdf")
            .set(
              "Content-Disposition",
              'attachment; filename="' +
                (req.body.proof === true
                  ? "kansi-koevedos"
                  : "kansi-painoaineisto") +
                '.pdf"'
            )
            .send(output.pdf);
        } finally {
          prepressBusy = false;
        }
      } catch (e) {
        res.status(422).json({
          error: e instanceof Error ? e.message : "Painovienti ei onnistunut.",
        });
      }
    }
  );
  router.post(
    "/projects",
    express.json({ limit: "24mb" }),
    async (req, res) => {
      try {
        const input = saveSchema.safeParse(req.body);
        if (!input.success) {
          res.sendStatus(400);
          return;
        }
        res
          .status(201)
          .json(
            await config.vault!.saveProject(
              token(req),
              input.data.project,
              input.data.id,
              input.data.revision
            )
          );
      } catch (e) {
        const reason = e instanceof Error ? e.message : "";
        res
          .status(
            reason === "conflict"
              ? 409
              : reason === "not-found"
                ? 404
                : reason === "quota" || reason === "rate"
                  ? 429
                  : e instanceof z.ZodError
                    ? 400
                    : 503
          )
          .json({
            error:
              reason === "conflict"
                ? "Projektia on muutettu toisella laitteella. Avaa uusin versio ennen tallentamista."
                : reason === "quota"
                  ? "Tallennusraja täyttyi. Poista tarpeettomia projekteja."
                  : "Tallennus ei onnistunut. Lataa työtiedosto talteen.",
          });
      }
    }
  );
  router.delete("/projects/:id", async (req, res) => {
    try {
      if (!z.string().uuid().safeParse(req.params.id).success) {
        res.sendStatus(404);
        return;
      }
      await config.vault!.deleteProject(token(req), req.params.id);
      res.sendStatus(204);
    } catch {
      res.sendStatus(503);
    }
  });
  router.use(
    (
      error: unknown,
      _req: Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      res
        .status((error as { status?: number })?.status === 413 ? 413 : 400)
        .json({ error: "Pyyntö ei kelpaa tai se on liian suuri." });
    }
  );
  app.use("/api/cover", router);
  app.get("/kansi-kirjaudu", (_req, res) => {
    const nonce = randomBytes(18).toString("base64");
    res.set({
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
      "X-Robots-Tag": "noindex",
      "Content-Security-Policy":
        "default-src 'none'; script-src 'nonce-" +
        nonce +
        "'; style-src 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
    });
    res
      .type("html")
      .send(
        `<!doctype html><html lang="fi"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Avaa kansiprojektisi | Thunder Kustannus</title><body style="font:18px system-ui;background:#f8f6f1;color:#253c34;max-width:600px;margin:70px auto;padding:24px"><h1>Avaa kansiprojektisi</h1><p>Vahvista oma sähköpostiosoitteesi. Käyttölinkki on henkilökohtainen ja voimassa 15 minuuttia.</p><label>Sähköpostiosoite<input id="email" type="email" autocomplete="email" style="display:block;padding:14px;width:90%;margin:12px 0"></label><button id="open" style="padding:16px;background:#c64600;color:white;border:0;border-radius:8px">Vahvista ja avaa kansisuunnittelija</button><p id="status" role="status"></p><a href="/kansisuunnittelija">Takaisin kansisuunnittelijaan</a><script nonce="${nonce}">const token=new URLSearchParams(location.hash.slice(1)).get("token")||"";history.replaceState(null,"","/kansi-kirjaudu");const button=document.getElementById("open"),status=document.getElementById("status");button.disabled=!/^[a-f0-9]{64}$/.test(token);button.addEventListener("click",async()=>{button.disabled=true;try{const email=document.getElementById("email").value;const response=await fetch("/api/cover/access/verify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token,email})});const data=await response.json();if(!response.ok)throw Error(data.error||"Kirjautuminen ei onnistunut.");location.replace("/kansisuunnittelija?cloud=1");}catch(error){status.textContent=error.message;button.disabled=false;}});</script></body></html>`
      );
  });
}
