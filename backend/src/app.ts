import cors from "cors";
import { sql } from "drizzle-orm";
import express, { type ErrorRequestHandler, type Express } from "express";
import { env } from "./config/env.js";
import { db } from "./db/client.js";
import { leadRouter } from "./modules/leads/lead.routes.js";

export function buildApp(): Express {
  const app = express();

  app.disable("x-powered-by");
  app.use(cors({
    origin: env.CORS_ORIGIN.split(",").map((origin) => origin.trim()),
    methods: ["GET", "POST", "PATCH", "OPTIONS"],
  }));
  app.use(express.json());

  app.get("/health", (_request, response) => {
    response.json({ status: "ok", service: "bnm3-backend" });
  });

  app.get("/ready", async (_request, response) => {
    try {
      await db.execute(sql`select 1`);
      response.json({ status: "ready", database: "connected" });
    } catch (error) {
      console.error(error);
      response.status(503).json({ status: "not_ready", database: "unavailable" });
    }
  });

  app.use("/api/v1/leads", leadRouter);

  const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
    console.error(error);
    const statusCode = typeof error.status === "number" ? error.status : 500;

    response.status(statusCode).json({
      error: statusCode < 500 ? error.message : "Internal server error",
    });
  };

  app.use(errorHandler);

  return app;
}
