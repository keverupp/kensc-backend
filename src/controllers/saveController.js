import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const uploadsBasePath = path.resolve("uploads");

export async function uploadSave(request, reply) {
  const userId = request.headers["x-user-id"];
  if (!userId) {
    return reply
      .code(400)
      .send({ error: "User ID (x-user-id) obrigatório no cabeçalho." });
  }

  let groupId = "";
  let type = "";
  let validated = false;
  let saveFolder = "";

  const parts = request.parts();

  for await (const part of parts) {
    if (part.type === "file") {
      if (!validated) {
        return reply
          .code(400)
          .send({ error: "Campos obrigatórios não enviados ou inválidos." });
      }

      const filename = path.basename(part.filename);
      const savePath = path.join(saveFolder, filename);

      const dir = path.dirname(savePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      await pipeline(part.file, fs.createWriteStream(savePath));
    } else {
      const field = part.fieldname;
      const value = part.value;

      if (field === "groupId") {
        groupId = value;
      }

      if (field === "type") {
        type = value;
      }

      if (groupId && type && !validated) {
        if (!["WORLD", "CHARACTER"].includes(type)) {
          return reply
            .code(400)
            .send({ error: "Tipo inválido. Use 'WORLD' ou 'CHARACTER'." });
        }

        const membership = await prisma.userGroup.findFirst({
          where: { userId, groupId },
        });

        if (!membership) {
          return reply
            .code(403)
            .send({ error: "Você não pertence a este grupo." });
        }

        saveFolder = path.join(uploadsBasePath, groupId, type.toLowerCase());

        if (fs.existsSync(saveFolder)) {
          fs.rmSync(saveFolder, { recursive: true, force: true });
        }
        fs.mkdirSync(saveFolder, { recursive: true });

        validated = true;
      }
    }
  }

  if (!validated) {
    return reply.code(400).send({ error: "Envio incompleto ou inválido." });
  }

  reply.code(201).send({ success: true });
}

export async function listFiles(request, reply) {
  const { groupId, type } = request.params;
  const userId = request.headers["x-user-id"];

  if (!userId) {
    return reply
      .code(400)
      .send({ error: "User ID (x-user-id) obrigatório no cabeçalho." });
  }

  if (!["WORLD", "CHARACTER"].includes(type)) {
    return reply
      .code(400)
      .send({ error: "Tipo inválido. Use 'WORLD' ou 'CHARACTER'." });
  }

  const membership = await prisma.userGroup.findFirst({
    where: { userId, groupId },
  });

  if (!membership) {
    return reply.code(403).send({ error: "Você não pertence a este grupo." });
  }

  const folder = path.join(uploadsBasePath, groupId, type.toLowerCase());

  if (!fs.existsSync(folder)) {
    return reply.code(404).send({ error: "Pasta de saves não encontrada." });
  }

  const files = listAllFiles(folder, folder);

  reply.send({ files });
}

// Função auxiliar para listar todos os arquivos e subpastas
function listAllFiles(base, current) {
  const entries = fs.readdirSync(current, { withFileTypes: true });
  let files = [];

  for (const entry of entries) {
    const fullPath = path.join(current, entry.name);
    const relativePath = path.relative(base, fullPath);

    if (entry.isDirectory()) {
      files = files.concat(listAllFiles(base, fullPath));
    } else {
      files.push(relativePath.replace(/\\/g, "/")); // Normalizar para URLs
    }
  }

  return files;
}

export async function statusSave(request, reply) {
  const { groupId } = request.params;
  const userId = request.headers["x-user-id"];

  if (!userId) {
    return reply
      .code(400)
      .send({ error: "User ID (x-user-id) obrigatório no cabeçalho." });
  }

  const membership = await prisma.userGroup.findFirst({
    where: { userId, groupId },
  });

  if (!membership) {
    return reply.code(403).send({ error: "Você não pertence a este grupo." });
  }

  const worldFolder = path.join(uploadsBasePath, groupId, "world");
  const characterFolder = path.join(uploadsBasePath, groupId, "character");

  let worldUpdatedAt = null;
  let characterUpdatedAt = null;

  if (fs.existsSync(worldFolder)) {
    const stats = fs.statSync(worldFolder);
    worldUpdatedAt = stats.mtime.toISOString(); // Data de modificação
  }

  if (fs.existsSync(characterFolder)) {
    const stats = fs.statSync(characterFolder);
    characterUpdatedAt = stats.mtime.toISOString();
  }

  reply.send({
    worldUpdatedAt,
    characterUpdatedAt,
  });
}
