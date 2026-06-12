import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { COOKIE_NAME } from "@shared/const";
import { jwtVerify } from "jose";
import { parse as parseCookies } from "cookie";
import { ENV } from "./env";
import * as db from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  try {
    const rawCookieHeader = opts.req.headers.cookie;
    const cookies = rawCookieHeader ? parseCookies(rawCookieHeader) : {};
    const token = cookies[COOKIE_NAME];
    if (token && ENV.cookieSecret) {
      const secret = new TextEncoder().encode(ENV.cookieSecret);
      const { payload } = await jwtVerify(token, secret);
      if (payload.openId && typeof payload.openId === "string") {
        user = (await db.getUserByOpenId(payload.openId)) ?? null;
      }
    }
  } catch {
    // Authentication is optional for public procedures.
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
