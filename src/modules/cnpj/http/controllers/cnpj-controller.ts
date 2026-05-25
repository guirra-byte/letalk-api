import type { FastifyReply, FastifyRequest } from "fastify";
import { pickLeadInputFields } from "../../services/lead-input-fields";
import { makeAbortBatchImport } from "../../services/factories/make-abort-batch-import";
import makeBatchImportWorker from "../../services/factories/make-batch-import-worker";
import { makeCnpjLookup } from "../../services/factories/make-cnpj-lookup";
import { makeDeleteLead } from "../../services/factories/make-delete-lead";
import { makeFetchLeads } from "../../services/factories/make-fetch-leads";
import { makeRequestPresignedUploadUrl } from "../../services/factories/make-request-presigned-upload-url";
import { makeStoreLookupAsLead } from "../../services/factories/make-store-lookup-as-lead";
import { makeSwitchLeadPipelineStatus } from "../../services/factories/make-switch-lead-pipeline-status";
import {
  batchImportBodySchema,
  batchImportIdParamsSchema,
  cnpjLookupBodySchema,
  fetchLeadsQuerySchema,
  leadIdParamsSchema,
  requestPresignedUploadUrlBodySchema,
  storeLookupAsLeadBodySchema,
  switchPipelineStatusBodySchema,
} from "../schemas/cnpj-schemas";
import type { PipelineStatus, Priority } from "../../../../../generated/prisma/enums";

export default class CnpjController {
  public static async lookup(request: FastifyRequest, reply: FastifyReply) {
    const data = cnpjLookupBodySchema.parse(request.body);

    const service = makeCnpjLookup();
    const lead = await service.execute({
      cnpj: data.cnpj,
      ...pickLeadInputFields(data),
    });

    return reply.status(200).send(lead);
  }

  public static async fetchLeads(request: FastifyRequest, reply: FastifyReply) {
    const filters = fetchLeadsQuerySchema.parse(request.query);

    const service = makeFetchLeads();
    const leads = await service.execute({
      pipelineStatus: filters.pipelineStatus as PipelineStatus,
      priority: filters.priority as Priority,
      search: filters.search as string,
    });

    return reply.status(200).send(leads);
  }

  public static async storeLookupAsLead(request: FastifyRequest, reply: FastifyReply) {
    const data = storeLookupAsLeadBodySchema.parse(request.body);

    const service = makeStoreLookupAsLead();
    const lead = await service.execute({
      cnpj: data.cnpj,
      pipelineStatus: data.pipelineStatus,
      priority: data.priority,
      ...pickLeadInputFields(data),
    });

    return reply.status(201).send(lead);
  }

  public static async deleteLead(request: FastifyRequest, reply: FastifyReply) {
    const { leadId } = leadIdParamsSchema.parse(request.params);

    const service = makeDeleteLead();
    await service.execute({ leadId });

    return reply.status(204).send();
  }

  public static async switchLeadPipelineStatus(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const { leadId } = leadIdParamsSchema.parse(request.params);
    const { pipelineStatus } = switchPipelineStatusBodySchema.parse(request.body);

    const service = makeSwitchLeadPipelineStatus();
    const lead = await service.execute({ leadId, pipelineStatus });

    return reply.status(200).send(lead);
  }

  public static async triggerBatchImport(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const data = batchImportBodySchema.parse(request.body);
    const batchImportWorker = makeBatchImportWorker();
    await batchImportWorker.dispatch(data.batchImportId);

    return reply.status(201).send({ message: "Batch import triggered successfully" });
  }

  public static async requestPresignedUploadUrl(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const data = requestPresignedUploadUrlBodySchema.parse(request.body);

    const service = makeRequestPresignedUploadUrl();
    const result = await service.execute(data);

    return reply.status(201).send(result);
  }

  public static async abortBatchImport(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const { batchImportId } = batchImportIdParamsSchema.parse(request.params);

    const service = makeAbortBatchImport();
    await service.execute({ batchImportId });

    return reply.status(204).send();
  }
}
