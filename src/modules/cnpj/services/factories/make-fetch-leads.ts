import { FetchLeads } from "../use-cases/fetch-leads";
import { cacheProvider, prismaClient } from ".";

export function makeFetchLeads() {
  return new FetchLeads(prismaClient, cacheProvider);
}
