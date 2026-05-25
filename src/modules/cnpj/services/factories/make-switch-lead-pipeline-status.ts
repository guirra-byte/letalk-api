import { SwitchLeadPipelineStatus } from "../use-cases/switch-lead-pipeline-status";
import { prismaClient } from ".";

export function makeSwitchLeadPipelineStatus() {
  return new SwitchLeadPipelineStatus(prismaClient);
}
