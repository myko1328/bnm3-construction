import { httpServerHandler } from "cloudflare:node";
import { buildApp } from "./app.js";

const workerPort = 3000;
const app = buildApp();

app.listen(workerPort);

export default httpServerHandler({ port: workerPort });
