import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().url().startsWith("postgresql://"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("Invalid backend environment configuration", result.error.flatten().fieldErrors);
  throw new Error("Backend environment configuration is invalid.");
}

export const env = result.data;
