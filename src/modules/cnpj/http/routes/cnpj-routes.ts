import type { FastifyInstance } from "fastify";
import { fetchLeadsCacheAsideMiddleware } from "@/core/handlers/cache/fetch-leads-pre-handler";
import { invalidateLeadsCacheOnSend } from "@/core/handlers/cache/invalidate-leads-cache-on-send";
import CnpjController from "../controllers/cnpj-controller";

export default async function CnpjRoutes(
  fastify: FastifyInstance
): Promise<void> {
  fastify.post("/lookup", CnpjController.lookup);
  fastify.post(
    "/batch-imports/presigned-upload-url",
    CnpjController.requestPresignedUploadUrl
  );
  fastify.post("/trigger-batch-import", CnpjController.triggerBatchImport);
  fastify.delete("/batch-imports/:batchImportId", CnpjController.abortBatchImport);

  fastify.get(
    "/leads",
    { preHandler: fetchLeadsCacheAsideMiddleware },
    CnpjController.fetchLeads
  );

  fastify.post(
    "/leads",
    { onSend: invalidateLeadsCacheOnSend },
    CnpjController.storeLookupAsLead
  );

  fastify.delete(
    "/leads/:leadId",
    { onSend: invalidateLeadsCacheOnSend },
    CnpjController.deleteLead
  );

  fastify.patch(
    "/leads/:leadId/pipeline-status",
    { onSend: invalidateLeadsCacheOnSend },
    CnpjController.switchLeadPipelineStatus
  );
}
