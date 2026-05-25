import type { PrismaClient } from "../../../../../generated/prisma/client";
import type { PipelineStatus } from "../../../../../generated/prisma/enums";
import { LeadNotFoundError } from "../../errors/errors";

export interface SwitchLeadPipelineStatusRequest {
  leadId: string;
  pipelineStatus: PipelineStatus;
}

export class SwitchLeadPipelineStatus {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(data: SwitchLeadPipelineStatusRequest) {
    const lead = await this.prisma.companyProfile.findUnique({
      where: { id: data.leadId },
      select: { id: true },
    });

    if (!lead) {
      throw new LeadNotFoundError(
        "[SwitchLeadPipelineStatusService]",
        404,
        `Lead ${data.leadId} not found`
      );
    }

    return this.prisma.companyProfile.update({
      where: { id: data.leadId },
      data: { pipelineStatus: data.pipelineStatus },
      include: {
        partners: true,
        cnaes: true,
        taxRegimes: true,
      },
    });
  }
}
