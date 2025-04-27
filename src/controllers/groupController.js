import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function createGroup(request, reply) {
  try {
    const { userId, name } = request.body;

    const group = await prisma.group.create({
      data: {
        name,
        createdById: userId,
        members: {
          create: {
            userId,
          },
        },
      },
    });

    reply.code(201).send({ groupId: group.id });
  } catch (error) {
    console.error(error);
    reply.code(500).send({ error: "Erro ao criar grupo." });
  }
}

export async function joinGroup(request, reply) {
  try {
    const { userId, groupId } = request.body;

    const membership = await prisma.userGroup.create({
      data: {
        userId,
        groupId,
      },
    });

    reply.code(201).send({ success: true });
  } catch (error) {
    console.error(error);
    reply.code(500).send({ error: "Erro ao entrar no grupo." });
  }
}

export async function listGroupMembers(request, reply) {
  try {
    const { groupId } = request.params;
    const userId = request.headers["x-user-id"]; // vamos enviar o userId pelo cabeçalho na requisição

    if (!userId) {
      return reply
        .code(400)
        .send({ error: "User ID não informado no cabeçalho." });
    }

    // Busca o grupo
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return reply.code(404).send({ error: "Grupo não encontrado." });
    }

    // Verifica se quem está pedindo é o criador do grupo
    if (group.createdById !== userId) {
      return reply
        .code(403)
        .send({
          error: "Acesso negado. Apenas o criador pode listar membros.",
        });
    }

    // Busca os membros
    const members = await prisma.userGroup.findMany({
      where: { groupId },
      select: {
        user: {
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
    });

    reply.send({
      groupId,
      members: members.map((m) => m.user),
    });
  } catch (error) {
    console.error(error);
    reply.code(500).send({ error: "Erro ao listar membros do grupo." });
  }
}
