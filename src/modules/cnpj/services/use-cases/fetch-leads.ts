import type { IRedisCacheProvider } from "@/core/providers/cache/cache-provider";
import type { CompanyProfile, PrismaClient } from "../../../../../generated/prisma/client";
import type {
  PipelineStatus,
  Priority,
} from "../../../../../generated/prisma/enums";
import { LEADS_CACHE_GEN_KEY, LEADS_CACHE_KEY } from "@/core/handlers/cache/leads-cache";
import { serializeLead } from "../serialize-lead";

export interface FetchLeadsRequest {
  pipelineStatus?: PipelineStatus;
  priority?: Priority;
  search?: string;
}

export class FetchLeads {
  private readonly leadsCacheKey = LEADS_CACHE_KEY;
  private readonly leadsCacheGenKey = LEADS_CACHE_GEN_KEY;
  private readonly LEADS_CACHE_TTL_SECONDS = 60 * 15;
  constructor(
    private readonly prisma: PrismaClient,
    private readonly cacheProvider: IRedisCacheProvider
  ) { }

  async execute(filters: FetchLeadsRequest = {}) {
    const generationAtStart = await this.readCacheGeneration();
    const where: Record<string, unknown> = {};

    if (filters.pipelineStatus) {
      where.pipelineStatus = filters.pipelineStatus;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.search && filters.search.trim().length > 0) {
      const term = filters.search.trim();
      where.OR = [
        { cnpj: { contains: term, mode: "insensitive" } },
        { legalName: { contains: term, mode: "insensitive" } },
        { tradeName: { contains: term, mode: "insensitive" } },
        { leadName: { contains: term, mode: "insensitive" } },
        { companyName: { contains: term, mode: "insensitive" } },
        { leadEmail: { contains: term, mode: "insensitive" } },
        { leadPhoneNumber: { contains: term, mode: "insensitive" } },
      ];
    }

    const leads = await this.prisma.companyProfile.findMany({
      where,
      include: {
        partners: true,
        cnaes: true,
        taxRegimes: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const serialized = leads.map(serializeLead);

    await this.cacheLeadsIfGenerationUnchanged(serialized, generationAtStart);

    return serialized;
  }

  private async readCacheGeneration(): Promise<number> {
    const value = await this.cacheProvider.get(this.leadsCacheGenKey);
    return value ? parseInt(value, 10) : 0;
  }

  private async cacheLeadsIfGenerationUnchanged(
    leads: CompanyProfile[],
    generationAtStart: number
  ) {
    const generationAfterFetch = await this.readCacheGeneration();

    if (generationAtStart !== generationAfterFetch) {
      console.info(
        `[FetchLeadsService] Skipping cache write — generation changed (${generationAtStart} → ${generationAfterFetch})`
      );
      return;
    }

    console.info(`[FetchLeadsService] Caching ${leads.length} leads for ${this.leadsCacheKey}`);
    await this.cacheProvider.set(this.leadsCacheKey, JSON.stringify(leads), this.LEADS_CACHE_TTL_SECONDS);
  }
}
