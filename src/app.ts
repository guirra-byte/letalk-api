import Fastify, {
  type FastifyError,
  type FastifyInstance,
  type FastifyReply,
  type FastifyRequest,
} from "fastify";
import cors from "@fastify/cors";
import { ZodError } from "zod";
import { AppError } from "./core/error/app-error";
import CnpjRoutes from "./modules/cnpj/http/routes/cnpj-routes";

const appPrefix = "/api/v1";

export const app = Fastify({ logger: true });

app.register(cors, {
  origin: process.env.FRONTEND_URL?.split(",") ?? true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
});

app.register((fastify: FastifyInstance) => {
  fastify.get(
    `${appPrefix}/health`,
    (_: FastifyRequest, reply: FastifyReply) => {
      return reply
        .status(200)
        .send({ status: true, message: "Server is running" });
    }
  );
});

app.register(CnpjRoutes, { prefix: `${appPrefix}/cnpj` });

app.setErrorHandler(
  (error: FastifyError, _request: FastifyRequest, reply: FastifyReply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        message: "Validation failed",
        issues: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
          code: issue.code,
        })),
      });
    }

    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        message: error.message,
        source: error.source,
      });
    }

    app.log.error(error);
    return reply.status(500).send({
      message: "Internal server error",
    });
  }
);
