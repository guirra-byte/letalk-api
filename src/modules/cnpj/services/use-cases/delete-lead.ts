import type { IRedisCacheProvider } from "@/core/providers/cache/cache-provider";
import type { PrismaClient } from "../../../../../generated/prisma/client";
import { LeadNotFoundError } from "../../errors/errors";

export interface DeleteLeadRequest {
  leadId: string;
}

export class DeleteLead {
  private readonly leadsCacheKey = "leads";
  constructor(private readonly prisma: PrismaClient, private readonly cacheProvider: IRedisCacheProvider) {}

  async execute(data: DeleteLeadRequest): Promise<{ id: string }> {
    const lead = await this.prisma.companyProfile.findUnique({
      where: { id: data.leadId },
      select: { id: true },
    });

    if (!lead) {
      throw new LeadNotFoundError(
        "[DeleteLeadService]",
        404,
        `Lead ${data.leadId} not found`
      );
    }

    await this.prisma.$transaction([
      this.prisma.partner.deleteMany({
        where: { companyProfileId: data.leadId },
      }),
      this.prisma.cnae.deleteMany({
        where: { companyProfileId: data.leadId },
      }),
      this.prisma.taxRegime.deleteMany({
        where: { companyProfileId: data.leadId },
      }),
      this.prisma.companyProfile.delete({ where: { id: data.leadId } }),
    ]);

    return { id: data.leadId };
  }
}
