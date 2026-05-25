import { RedisCacheProvider, type IRedisCacheProvider } from "@/core/providers/cache/cache-provider";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { CompanyProfile } from "../../../../generated/prisma/client";
import { LEADS_CACHE_KEY } from "@/core/handlers/cache/leads-cache";
import { serializeLead } from "@/modules/cnpj/services/serialize-lead";

class FetchLeadsCacheAsideMiddleware {
  constructor(private readonly cacheProvider: IRedisCacheProvider) {}

  async execute(_request: FastifyRequest, reply: FastifyReply) {
    const cachedLeads = await this.cacheProvider.get(LEADS_CACHE_KEY);
    if (cachedLeads) {
      console.info(
        `[FetchLeadsCacheAsideMiddleware] Returning cached leads for ${LEADS_CACHE_KEY}`
      );
      const parsedLeads = JSON.parse(cachedLeads) as CompanyProfile[];
      return reply.status(200).send(parsedLeads.map(serializeLead));
    }

    console.info(
      `[FetchLeadsCacheAsideMiddleware] No cached leads found for ${LEADS_CACHE_KEY}`
    );
  }
}

export async function fetchLeadsCacheAsideMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const middleware = new FetchLeadsCacheAsideMiddleware(new RedisCacheProvider());
  return middleware.execute(request, reply);
}
