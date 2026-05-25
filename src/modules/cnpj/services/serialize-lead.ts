import type { CompanyProfile } from "../../../../generated/prisma/client";

type LegacyLeadFields = {
  contactName?: string | null;
  contactEmail?: string | null;
  phone?: string | null;
};

type LeadProfileLike = CompanyProfile &
  LegacyLeadFields & {
    leadName?: string | null;
    leadEmail?: string | null;
    leadPhoneNumber?: string | null;
  };

export function serializeLead(profile: CompanyProfile) {
  const raw = profile as LeadProfileLike;
  const { contactName, contactEmail, phone, ...rest } = raw;

  return {
    ...rest,
    leadName: raw.leadName ?? contactName ?? null,
    leadEmail: raw.leadEmail ?? contactEmail ?? null,
    leadPhoneNumber: raw.leadPhoneNumber ?? phone ?? null,
  };
}
