import { z } from "zod";
import {
  PipelineStatus,
  Priority,
} from "../../../../../generated/prisma/enums";

export const pipelineStatusSchema = z.enum(
  Object.values(PipelineStatus) as [string, ...string[]]
) as z.ZodType<keyof typeof PipelineStatus>;

export const prioritySchema = z.enum(
  Object.values(Priority) as [string, ...string[]]
) as z.ZodType<keyof typeof Priority>;

const cnpjStringSchema = z
  .string({ message: "cnpj is required" })
  .transform((value) => value.replace(/\D/g, ""))
  .refine((value) => value.length === 14, {
    message: "cnpj must contain 14 digits",
  });

const optionalTrimmedString = z.string().trim().optional();

const optionalEmailSchema = z
  .string()
  .trim()
  .email("email must be valid")
  .optional()
  .or(z.literal(""))
  .transform((value) => (value === "" ? undefined : value));

export const leadInputFieldsSchema = z.object({
  leadName: optionalTrimmedString,
  leadEmail: optionalEmailSchema,
  leadPhoneNumber: optionalTrimmedString,
  companyName: optionalTrimmedString,
});

export const cnpjLookupBodySchema = leadInputFieldsSchema.extend({
  cnpj: cnpjStringSchema,
});
export type CnpjLookupBody = z.infer<typeof cnpjLookupBodySchema>;

export const storeLookupAsLeadBodySchema = leadInputFieldsSchema.extend({
  cnpj: cnpjStringSchema,
  pipelineStatus: pipelineStatusSchema,
  priority: prioritySchema,
});

export type StoreLookupAsLeadBody = z.infer<typeof storeLookupAsLeadBodySchema>;

export const fetchLeadsQuerySchema = z.object({
  pipelineStatus: pipelineStatusSchema.optional(),
  priority: prioritySchema.optional(),
  search: z.string().trim().min(1).optional(),
});

export type FetchLeadsQuery = z.infer<typeof fetchLeadsQuerySchema>;

export const leadIdParamsSchema = z.object({
  leadId: z.string({ message: "leadId must be a valid string" }) as z.ZodType<string>,
});

export type LeadIdParams = z.infer<typeof leadIdParamsSchema>;

export const switchPipelineStatusBodySchema = z.object({
  pipelineStatus: pipelineStatusSchema,
});

export type SwitchPipelineStatusBody = z.infer<
  typeof switchPipelineStatusBodySchema
>;

export const batchImportBodySchema = z.object({
  batchImportId: z.string({ message: "batchImportId must be a valid string" }) as z.ZodType<string>,
});

export type BatchImportBody = z.infer<typeof batchImportBodySchema>;

export const requestPresignedUploadUrlBodySchema = z.object({
  fileName: z.string().trim().min(1, "fileName is required"),
  mimetype: z.string().trim().min(1, "mimetype is required"),
});

export type RequestPresignedUploadUrlBody = z.infer<
  typeof requestPresignedUploadUrlBodySchema
>;

export const batchImportIdParamsSchema = z.object({
  batchImportId: z.string().uuid("batchImportId must be a valid uuid"),
});

export type BatchImportIdParams = z.infer<typeof batchImportIdParamsSchema>;
