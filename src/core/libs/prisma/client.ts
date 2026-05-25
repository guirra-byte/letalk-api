import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../../../generated/prisma/client";
import { getApplicationPgPool } from "./pg-pool";

const prisma = new PrismaClient({
  adapter: new PrismaPg(getApplicationPgPool()),
});

export default prisma;