import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api-error";
import { CreateMessageDto } from "@/shared/schemas/message/create-message.schema";

export async function getConversationMessages(
  conversationId: string,
  userId: string
) {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  const membership = await prisma.conversationMember.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
  });

  if (!membership) {
    throw new ApiError(
      403,
      "You are not a member of this conversation"
    );
  }

  // 1. Added await here so messages resolves to an array
  const messages = await prisma.message.findMany({
    where: {
      conversationId,
    },
    orderBy: {
      createdAt: "asc",
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
     
    },
  });

  return messages.map((msg) => ({
    ...msg,
    createdAt: msg.createdAt.toISOString(),
    updatedAt: msg.updatedAt.toISOString(),
  }));
}

export async function createMessage(
  conversationId: string,
  userId: string,
  data: CreateMessageDto
) {
  const membership =
    await prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

  if (!membership) {
    throw new ApiError(
      403,
      "You are not a member of this conversation"
    );
  }

  const message = await prisma.$transaction(async (tx) => {
    const newMessage = await tx.message.create({
      data: {
        conversationId,
        senderId: userId,
        content: data.content,
        type: "TEXT",
      },
  
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
  
        receipts: {
          select: {
            id: true,
            userId: true,
            readAt: true,
          },
        },
      },
    });

    
    await tx.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        lastMessageAt: newMessage.createdAt,
      },
    });
    
    return newMessage;
  });
  
  return message;
}