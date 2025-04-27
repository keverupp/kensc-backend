import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { v4 as uuidv4 } from "uuid";

export async function registerUser(request, reply) {
  try {
    const newUser = await prisma.user.create({
      data: {
        id: uuidv4(),
      },
    });
    reply.code(201).send({ userId: newUser.id });
  } catch (error) {
    console.error(error);
    reply.code(500).send({ error: "Erro ao registrar usuário." });
  }
}
