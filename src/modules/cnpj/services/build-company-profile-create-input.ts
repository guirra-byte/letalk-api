import { CnaeType } from "../../../../generated/prisma/enums";
import type {
  PipelineStatus,
  Priority,
} from "../../../../generated/prisma/enums";
import {
  applyLeadInputFields,
  type LeadInputFields,
} from "./lead-input-fields";
import type { CnpjLookupResponse } from "./use-cases/cnpj-lookup";

export interface BuildCompanyProfileCreateInputOptions {
  pipelineStatus: PipelineStatus;
  priority: Priority;
  isImported?: boolean;
  importedAt?: Date;
  inputFields?: Partial<LeadInputFields>;
}

export function buildCompanyProfileCreateInput(
  preview: CnpjLookupResponse,
  options: BuildCompanyProfileCreateInputOptions
) {
  const merged = applyLeadInputFields(preview, options.inputFields);
  const partners = merged.partners ?? [];
  const secondary = merged.secondaryActivities ?? [];
  const taxRegimes = merged.taxRegimes ?? [];
  const primary = merged.primaryActivity;

  const cnaeRows = [
    ...(primary
      ? [
          {
            code: primary.code,
            description: primary.description,
            type: CnaeType.PRIMARY,
          },
        ]
      : []),
    ...secondary.map((c) => ({
      code: c.code,
      description: c.description,
      type: CnaeType.SECONDARY,
    })),
  ];

  return {
    cnpj: merged.cnpj,
    pipelineStatus: options.pipelineStatus,
    priority: options.priority,

    legalName: merged.legalName ?? "",
    tradeName: merged.tradeName ?? null,
    email: merged.email ?? null,

    leadName: merged.leadName ?? null,
    leadEmail: merged.leadEmail ?? null,
    leadPhoneNumber: merged.leadPhoneNumber ?? null,
    companyName: merged.companyName ?? null,

    capitalSocial: Math.trunc(Number(merged.capitalSocial ?? 0)),

    foundedAt: merged.foundedAt ? new Date(merged.foundedAt) : new Date(),

    primaryActivity: primary
      ? `${primary.code} - ${primary.description}`
      : "",

    zipCode: merged.location?.zipCode ?? "",
    street: merged.location?.street ?? "",
    number: merged.location?.number ?? "",
    complement: merged.location?.complement ?? null,
    neighborhood: merged.location?.neighborhood ?? "",
    city: merged.location?.city ?? "",
    state: merged.location?.state ?? "",

    isImported: options.isImported ?? false,
    importedAt: options.importedAt ?? null,

    partners: {
      create: partners.map((p) => ({
        name: p.name,
        role: p.role,
        cnpjOrCpf: p.cnpjOrCpf,
        ageRange: p.ageRange ?? null,
        joinedAt: p.joinedAt ? new Date(p.joinedAt) : new Date(),
      })),
    },
    cnaes: {
      create: cnaeRows,
    },
    taxRegimes: {
      create: taxRegimes.map((t) => ({
        year: Number(t.year),
        taxationType: t.taxationType,
      })),
    },
  };
}
