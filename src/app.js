import Fastify from "fastify";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

import fastifyMultipart from "@fastify/multipart"; // atualizado
import fastifyStatic from "@fastify/static"; // atualizado
import fastifyPostgres from "@fastify/postgres"; // novo, se for conectar aqui
import fastifyCors from "@fastify/cors";

import userRoutes from "./routes/userRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import saveRoutes from "./routes/saveRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = Fastify({ logger: true });

app.register(fastifyCors, {
  origin: true, // permite qualquer origem
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"], // 👈 adiciona todos os métodos necessários
});

// Plugins
app.register(fastifyMultipart, {
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
});
app.register(fastifyStatic, {
  root: path.join(__dirname, "../uploads"),
  prefix: "/uploads/",
});

app.register(fastifyPostgres, { connectionString: process.env.DATABASE_URL });

// Rotas
app.register(userRoutes, { prefix: "/user" });
app.register(groupRoutes, { prefix: "/group" });
app.register(saveRoutes, { prefix: "/save" });

// Start server
const start = async () => {
  try {
    await app.listen({ port: process.env.PORT || 3000, host: "0.0.0.0" });
    console.log("Server running on port", process.env.PORT || 3000);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
