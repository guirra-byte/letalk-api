import { DeleteLead } from "../use-cases/delete-lead";
import { cacheProvider, prismaClient } from ".";

export function makeDeleteLead() {
  return new DeleteLead(prismaClient, cacheProvider);
}
