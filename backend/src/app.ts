import cors from "@fastify/cors";
import Fastify, { type FastifyError } from "fastify";
import { sql } from "drizzle-orm";
import { env } from "./config/env.js";
import { db } from "./db/client.js";
import { leadRoutes } from "./modules/leads/lead.routes.js";

export function buildApp() {
  const app = Fastify({ logger: true });

  app.register(cors, {
    origin: env.CORS_ORIGIN.split(",").map((origin) => origin.trim()),
    methods: ["GET", "POST", "PATCH", "OPTIONS"],
  });

  app.get("/health", async () => ({ status: "ok", service: "bnm3-backend" }));
  app.get("/ready", async (_request, reply) => {
    try {
      await db.execute(sql`select 1`);
      return { status: "ready", database: "connected" };
    } catch (error) {
      app.log.error(error);
      return reply.code(503).send({ status: "not_ready", database: "unavailable" });
    }
  });

  app.register(leadRoutes, { prefix: "/api/v1/leads" });

  app.setErrorHandler((error: FastifyError, _request, reply) => {
    app.log.error(error);
    reply.code(error.statusCode ?? 500).send({
      error: error.statusCode && error.statusCode < 500 ? error.message : "Internal server error",
    });
  });

  return app;
}
