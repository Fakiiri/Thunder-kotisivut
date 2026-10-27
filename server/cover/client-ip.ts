import { isIP } from "node:net";
import type { Request } from "express";

// Railway's public HTTP edge overwrites X-Real-IP. Private networking does
// not: accept it only in Railway and for this service's configured public host.
// This is a rate-limit bucket, never an authentication or authorization claim.
// https://docs.railway.com/networking/public-networking/specs-and-limits
export function coverClientIp(
  req: Pick<Request, "headers" | "socket">,
  base: string,
  railwayEnvironment = process.env.RAILWAY_ENVIRONMENT_ID
) {
  const remote = req.socket.remoteAddress || "unknown";
  const host = req.headers.host?.toLowerCase();
  const supplied = req.headers["x-real-ip"];
  const publicHost = new URL(base).host.toLowerCase();
  if (
    railwayEnvironment &&
    new URL(base).protocol === "https:" &&
    host === publicHost &&
    typeof supplied === "string" &&
    isIP(supplied.trim())
  ) return supplied.trim();
  return remote;
}
