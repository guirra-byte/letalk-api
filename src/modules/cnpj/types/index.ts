export interface CompanyProfile {
  legalName: string;
  tradeName?: string;

  capitalSocial: number;

  email?: string;
  leadName?: string;
  leadEmail?: string;
  leadPhoneNumber?: string;
  companyName?: string;

  foundedAt: string;

  location: CompanyLocation;

  primaryActivity: Cnae;
  secondaryActivities: Cnae[];

  taxRegimes: TaxRegime[];

  partners: Partner[];
}

export interface CompanyLocation {
  zipCode: string;

  street: string;
  number: string;
  complement?: string;

  neighborhood: string;

  city: string;
  state: string;
}

export interface Cnae {
  code: string;
  description: string;
}

export interface TaxRegime {
  year: number;
  taxationType: string;
}

export interface Partner {
  name: string;
  role: string;
  cnpjOrCpf: string;
  ageRange?: string;
  joinedAt: string;
}
