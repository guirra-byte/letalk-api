import { Pool } from "pg";
import { env } from "process";

let applicationPool: Pool | null = null;

/**
 * Pool único derivado de `DATABASE_URL` (mesmos parâmetros de SSL/query que o Prisma).
 * LangGraph PostgresSaver e o adapter Prisma compartilham este pool.
 */
export function getApplicationPgPool(): Pool {
  if (!applicationPool) {
    const connectionUrl = new URL(env.DATABASE_URL ?? "");
    connectionUrl.searchParams.set(
      "connection_limit",
      env.DB_CONNECTION_LIMIT?.toString() ?? "10"
    );
    
    connectionUrl.searchParams.set(
      "pool_timeout",
      env.DB_POOL_TIMEOUT?.toString() ?? "10000"
    );

    const ssl = env.NODE_ENV === "prod" ? { rejectUnauthorized: false } : undefined;
    applicationPool = new Pool({
      connectionString: connectionUrl.toString(),
      max: env.DB_CONNECTION_LIMIT ? Number(env.DB_CONNECTION_LIMIT) : 10,
      connectionTimeoutMillis: env.DB_POOL_TIMEOUT ? Number(env.DB_POOL_TIMEOUT) : 10000,
      ssl,
    });
  }

  return applicationPool;
}