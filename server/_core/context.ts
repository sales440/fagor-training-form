import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { getUserFromRequest, type AdminUser } from "./simpleAuth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: AdminUser | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  const user = getUserFromRequest(opts.req);

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
