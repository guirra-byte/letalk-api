import type { IRedisCacheProvider } from "@/core/providers/cache/cache-provider";
import type { PrismaClient } from "../../../../../generated/prisma/client";
import { MissingCachedCnpjLookupError } from "../../errors/errors";
import { buildCompanyProfileCreateInput } from "../build-company-profile-create-input";
import { pickLeadInputFields, type LeadInputFields } from "../lead-input-fields";
import type { CnpjLookupResponse } from "./cnpj-lookup";
import { CNPJ_LOOKUP_CACHE_KEY_PREFIX } from "./cnpj-lookup";
import type {
  PipelineStatus,
  Priority,
} from "../../../../../generated/prisma/enums";

export interface StoreLookupAsLeadRequest extends LeadInputFields {
  cnpj: string;
  pipelineStatus: PipelineStatus;
  priority: Priority;
}

export class StoreLookupAsLead {
  constructor(
    private readonly cacheProvider: IRedisCacheProvider,
    private readonly prisma: PrismaClient
  ) {}

  async execute(data: StoreLookupAsLeadRequest) {
    const sanitizedCnpj = data.cnpj.replace(/\D/g, "");
    const cacheKey = `${CNPJ_LOOKUP_CACHE_KEY_PREFIX}${sanitizedCnpj}`;

    const cached = await this.cacheProvider.get(cacheKey);
    if (!cached) {
      throw new MissingCachedCnpjLookupError(
        "[StoreLookupAsLeadService]",
        404,
        `No cached CNPJ lookup found for ${sanitizedCnpj}. Run /cnpj/lookup first.`
      );
    }

    const preview = JSON.parse(cached) as CnpjLookupResponse;

    const createInput = buildCompanyProfileCreateInput(preview, {
      pipelineStatus: data.pipelineStatus,
      priority: data.priority,
      inputFields: pickLeadInputFields(data),
    });

    const lead = await this.prisma.companyProfile.create({
      data: createInput,
      include: {
        partners: true,
        cnaes: true,
        taxRegimes: true,
      },
    });

    await this.cacheProvider.del(cacheKey);

    return lead;
  }
}
