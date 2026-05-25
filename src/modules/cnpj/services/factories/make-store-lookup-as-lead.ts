import { StoreLookupAsLead } from "../use-cases/store-lookup-as-lead";
import { cacheProvider, prismaClient } from ".";

export function makeStoreLookupAsLead() {
  return new StoreLookupAsLead(cacheProvider, prismaClient);
}
