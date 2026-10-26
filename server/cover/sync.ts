import {
  journeyProjection,
  parseJourneyLists,
  type JourneyLists,
  type BrevoContact,
} from "../../shared/cover-journey";
import type { CoverVault } from "./vault";
export type CoverSyncJob = {
  owner: string;
  revision: number;
  attempts: number;
  lease: string;
};
export type CoverSyncQueue = {
  claimSync(): Promise<CoverSyncJob | null>;
  finishSync(job: CoverSyncJob, idle?: boolean): Promise<void>;
  failSync(job: CoverSyncJob, permanent: boolean): Promise<void>;
  hasPaidOrder(email: string): Promise<boolean>;
};
export class CoverSyncError extends Error {
  constructor(public retryable: boolean) {
    super("Cover contact sync unavailable");
  }
}
export async function syncCoverContact(
  job: CoverSyncJob,
  vault: CoverVault,
  queue: CoverSyncQueue,
  config: { apiKey: string; lists: JourneyLists; request?: typeof fetch }
) {
  const lists = parseJourneyLists(config.lists),
    request = config.request || fetch;
  const audience = await vault.journeyAudience(job.owner);
  // An address may have expired or never have been verified. Never guess it.
  if (!audience) {
    await queue.finishSync(job, true);
    return;
  }
  async function call(path: string, method = "GET", data?: unknown) {
    const response = await request("https://api.brevo.com/v3" + path, {
      method,
      signal: AbortSignal.timeout(10000),
      headers: {
        "api-key": config.apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      ...(data ? { body: JSON.stringify(data) } : {}),
    });
    if (!response.ok && !(method === "GET" && response.status === 404))
      throw new CoverSyncError(
        response.status === 429 || response.status >= 500
      );
    return response;
  }
  const result = await call("/contacts/" + encodeURIComponent(audience.email));
  const contact: BrevoContact =
    result.status === 404 ? { listIds: [] } : await result.json();
  if (
    (result.status !== 404 && typeof contact.emailBlacklisted !== "boolean") ||
    !Array.isArray(contact.listIds) ||
    !contact.listIds.every(Number.isSafeInteger)
  )
    throw new CoverSyncError(false);
  const projection = journeyProjection(
    audience,
    contact,
    lists,
    await queue.hasPaidOrder(audience.email)
  );
  // Remove stale stage membership FIRST. Adding the new membership is a
  // Brevo automation trigger; interrupted sync resumes idempotently.
  for (const id of projection.remove)
    await call("/contacts/lists/" + id + "/contacts/remove", "POST", {
      emails: [audience.email],
    });
  if (projection.add.length) {
    await call("/contacts", "POST", {
      email: audience.email,
      updateEnabled: true,
      listIds: projection.add,
      // Never set emailBlacklisted=false or restore someone else's consent.
    });
  }
  await queue.finishSync(job, projection.stopped || !audience.marketing);
}
export async function processCoverSyncBatch(
  vault: CoverVault,
  queue: CoverSyncQueue,
  config: Parameters<typeof syncCoverContact>[3],
  maxJobs = 10
) {
  for (let n = 0; n < maxJobs; n++) {
    const job = await queue.claimSync();
    if (!job) break;
    try {
      await syncCoverContact(job, vault, queue, config);
    } catch (error) {
      await queue.failSync(
        job,
        error instanceof CoverSyncError && !error.retryable
      );
      console.error("[Cover] Contact sync pending retry or review");
    }
  }
}
