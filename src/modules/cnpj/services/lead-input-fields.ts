export interface LeadInputFields {
  leadName?: string;
  leadEmail?: string;
  leadPhoneNumber?: string;
  companyName?: string;
}

type LeadInputFieldsInput = {
  [K in keyof LeadInputFields]?: LeadInputFields[K] | undefined;
};

export function applyLeadInputFields<T extends LeadInputFields>(
  base: T,
  input?: Partial<LeadInputFields>
): T {
  if (!input) return base;

  return {
    ...base,
    ...(input.leadName?.trim() && {
      leadName: input.leadName.trim(),
    }),
    ...(input.leadEmail?.trim() && {
      leadEmail: input.leadEmail.trim(),
    }),
    ...(input.leadPhoneNumber?.trim() && {
      leadPhoneNumber: input.leadPhoneNumber.trim(),
    }),
    ...(input.companyName?.trim() && {
      companyName: input.companyName.trim(),
    }),
  };
}

export function pickLeadInputFields(
  input?: LeadInputFieldsInput
): Partial<LeadInputFields> {
  if (!input) return {};

  const fields: Partial<LeadInputFields> = {};

  if (input.leadName?.trim()) {
    fields.leadName = input.leadName.trim();
  }
  if (input.leadEmail?.trim()) {
    fields.leadEmail = input.leadEmail.trim();
  }
  if (input.leadPhoneNumber?.trim()) {
    fields.leadPhoneNumber = input.leadPhoneNumber.trim();
  }
  if (input.companyName?.trim()) {
    fields.companyName = input.companyName.trim();
  }

  return fields;
}

export function sanitizeCnpj(cnpj: string): string {
  return cnpj.replace(/\D/g, "");
}

export function isValidCnpj(cnpj: string): boolean {
  return sanitizeCnpj(cnpj).length === 14;
}
