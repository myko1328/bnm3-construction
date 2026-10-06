import { buildApp } from "./app.js";
import { env } from "./config/env.js";

const app = buildApp();

const server = app.listen(env.PORT, env.HOST, () => {
  console.log(`BNM3 backend listening on http://${env.HOST}:${env.PORT}`);
});

const shutdown = (signal: string) => {
  console.log(`${signal} received. Shutting down.`);
  server.close((error) => {
    if (error) {
      console.error(error);
      process.exitCode = 1;
    }
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
