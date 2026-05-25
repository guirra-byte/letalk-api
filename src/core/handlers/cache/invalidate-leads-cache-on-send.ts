import type { FastifyReply, FastifyRequest } from "fastify";
import {
  invalidateLeadsCache,
} from "@/core/handlers/cache/leads-cache";

export async function invalidateLeadsCacheOnSend(
  _request: FastifyRequest,
  reply: FastifyReply,
  payload: unknown
) {
  if (reply.statusCode >= 200 && reply.statusCode < 300) {
    await invalidateLeadsCache();
  }

  return payload;
}
