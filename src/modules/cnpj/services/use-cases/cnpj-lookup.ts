import type { IRedisCacheProvider } from "@/core/providers/cache/cache-provider";
import { CnpjLookUpApiError } from "../../errors/errors";
import type { CompanyProfile } from "../../types";
import type { ISearchCnpjProvider } from "@/core/providers/search-cnpj/search-cnpj-provider";
import {
  applyLeadInputFields,
  pickLeadInputFields,
  type LeadInputFields,
} from "../lead-input-fields";

export interface CnpjLookupRequest extends LeadInputFields {
  cnpj: string;
}

export type CnpjLookupResponse = Partial<CompanyProfile> &
  LeadInputFields & { cnpj: string };

export const CNPJ_LOOKUP_CACHE_KEY_PREFIX = "cnpj-lookup:";
export const CNPJ_LOOKUP_CACHE_TTL_SECONDS = 60 * 15;

function mapPayloadToDTO(
  cnpj: string,
  payload: any
): CnpjLookupResponse {
  let companyProfile: CnpjLookupResponse = {
    cnpj,
    legalName: payload.razao_social,
    tradeName: payload.nome_fantasia ?? undefined,
    email: payload.email ?? undefined,
    foundedAt: payload.data_inicio_atividade,
    primaryActivity: {
      code: String(payload.cnae_fiscal ?? ""),
      description: payload.cnae_fiscal_descricao ?? "CNAE Fiscal",
    },
    location: {
      state: payload.uf,
      city: payload.municipio,
      number: payload.numero,
      neighborhood: payload.bairro,
      zipCode: payload.cep,
      street: payload.logradouro,
      complement: payload.complemento ?? undefined,
    },
    capitalSocial: Number(payload.capital_social ?? 0),
  };

  if (Array.isArray(payload.qsa) && payload.qsa.length > 0) {
    companyProfile = {
      ...companyProfile,
      partners: payload.qsa.map((partner: any) => ({
        name: partner.nome_socio,
        role: partner.qualificacao_socio,
        cnpjOrCpf: partner.cnpj_cpf_do_socio,
        joinedAt: partner.data_entrada_sociedade,
        ageRange: partner.faixa_etaria ?? undefined,
      })),
    };
  }

  if (
    Array.isArray(payload.cnaes_secundarios) &&
    payload.cnaes_secundarios.length > 0
  ) {
    companyProfile = {
      ...companyProfile,
      secondaryActivities: payload.cnaes_secundarios
        .filter((cnae: any) => cnae?.codigo)
        .map((cnae: any) => ({
          code: String(cnae.codigo),
          description: cnae.descricao,
        })),
    };
  }

  if (
    Array.isArray(payload.regime_tributario) &&
    payload.regime_tributario.length > 0
  ) {
    companyProfile = {
      ...companyProfile,
      taxRegimes: payload.regime_tributario.map((tax: any) => ({
        year: Number(tax.ano),
        taxationType: tax.forma_de_tributacao,
      })),
    };
  }

  return companyProfile;
}

export class CnpjLookup {
  constructor(
    private readonly searchCnpjProvider: ISearchCnpjProvider,
    private readonly cacheProvider: IRedisCacheProvider
  ) {}

  async execute(data: CnpjLookupRequest): Promise<CnpjLookupResponse> {
    const sanitizedCnpj = data.cnpj.replace(/\D/g, "");
    const inputFields = pickLeadInputFields(data);

    const cacheKey = `${CNPJ_LOOKUP_CACHE_KEY_PREFIX}${sanitizedCnpj}`;
    const cached = await this.cacheProvider.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached) as CnpjLookupResponse;
      return applyLeadInputFields(parsed, inputFields);
    }

    const request = await this.searchCnpjProvider.search(sanitizedCnpj);
    if (request.status >= 400) {
      throw new CnpjLookUpApiError(
        "[CnpjLookupService]",
        request.statusText || "Failed to fetch CNPJ data",
        request.status
      );
    }

    const payload =
      typeof request.data === "string" ? JSON.parse(request.data) : request.data;

    const parsed = applyLeadInputFields(
      mapPayloadToDTO(sanitizedCnpj, payload),
      inputFields
    );

    await this.cacheProvider.set(
      cacheKey,
      JSON.stringify(parsed),
      CNPJ_LOOKUP_CACHE_TTL_SECONDS
    );

    return parsed;
  }
}
