import { AppError } from "@/core/error/app-error";

export class CnpjLookUpApiError extends AppError {
  constructor(src: string, reason: string, statusCode: number) {
    super(src, reason, statusCode);
  }
}

export class MissingCachedCnpjLookupError extends AppError {
  constructor(src: string, statusCode: number, reason?: string) {
    super(src, reason ?? "Missing cached CNPJ lookup error", statusCode);
  }
}

export class LeadNotFoundError extends AppError {
  constructor(src: string, statusCode: number, reason?: string) {
    super(src, reason ?? "Lead not found error", statusCode);
  }
}

export class BatchImportNotFoundError extends AppError {
  constructor(src: string, statusCode: number, reason?: string) {
    super(src, reason ?? "Batch import not found error", statusCode);
  }
}

export class BatchImportWorkerUndefinedParentPort extends AppError {
  constructor(src: string, statusCode: number, reason?: string) {
    super(src, reason ?? "Batch import worker undefined parent port error", statusCode);
  }
}