import { SearchCnpjProvider } from "@/core/providers/search-cnpj/search-cnpj-provider";
import { CnpjLookup } from "../use-cases/cnpj-lookup";
import { cacheProvider } from ".";

export function makeCnpjLookup() {
  const searchCnpjProvider = new SearchCnpjProvider();
  return new CnpjLookup(searchCnpjProvider, cacheProvider);
}
