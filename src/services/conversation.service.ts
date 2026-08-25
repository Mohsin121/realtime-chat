import { ApiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { CreateConversationDto } from "@/shared/schemas/conversation/create-conversation.schema";


function formatLastMessage(lastMessage: any) {
  if (!lastMessage) return null;

  return {
    id: lastMessage.id,
    conversationId: lastMessage.conversationId,
    senderId: lastMessage.senderId,
    content: lastMessage.content,
    type: lastMessage.type,
    createdAt: lastMessage.createdAt.toISOString(),
  };
}

export async function getUserConversations(userId: string) {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  const memberships = await prisma.conversationMember.findMany({
    where: { userId },
    select: {
      lastReadAt: true,
      conversation: {
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                  createdAt:true
                },
              },
            },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
    orderBy: {
      conversation: {
        lastMessageAt: "desc",
      },
    },
  });

  return await Promise.all(
    memberships.map(async (membership) => {
      const { conversation, lastReadAt } = membership;

      const otherMember = conversation.members.find(
        (member) => member.userId !== userId
      );

      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conversation.id,
          createdAt: { gt: lastReadAt },
          senderId: { not: userId },
        },
      });

      const lastMessage = conversation.messages[0] || null;

      return {
        id: conversation.id,
        type: conversation.type,
        name: conversation.type === "GROUP" ? conversation.name : otherMember?.user.name ?? null,
        avatar: conversation.type === "GROUP" ? conversation.avatar : otherMember?.user.avatar ?? null,
        otherUser: otherMember?.user || null,
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              conversationId: lastMessage.conversationId,
              senderId: lastMessage.senderId,
              content: lastMessage.content,
              type: lastMessage.type,
              createdAt: lastMessage.createdAt.toISOString(),
            }
          : null,
        unreadCount,
      };
    })
  );
}

export async function getConversationById(conversationId: string, userId: string) {
    const membership = await prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
      include: {
        conversation: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    createdAt:true
                  },
                },
              },
            },
            messages: {
              take: 1,
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    });
  
    if (!membership) {
      throw new ApiError(404, "Conversation not found or access denied");
    }
  
    const { conversation, lastReadAt } = membership;
    const otherMember = conversation.members.find((m) => m.userId !== userId);
    const lastMessage = conversation.messages[0] || null;
  
    const unreadCount = await prisma.message.count({
      where: {
        conversationId: conversation.id,
        createdAt: { gt: lastReadAt },
        senderId: { not: userId },
      },
    });
  
    return {
      id: conversation.id,
      type: conversation.type,
      name: conversation.type === "GROUP" ? conversation.name : otherMember?.user.name ?? null,
      avatar: conversation.type === "GROUP" ? conversation.avatar : otherMember?.user.avatar ?? null,
      otherUser: otherMember?.user || null,
      lastMessage: formatLastMessage(lastMessage),
      unreadCount,
      lastMessageAt: conversation.lastMessageAt.toISOString(),
      createdAt: conversation.createdAt.toISOString(),
      updatedAt: conversation.updatedAt.toISOString(),
    };
  }

export async function createDirectConversation(
  currentUserId: string,
  data: CreateConversationDto
) {
  if (currentUserId === data.userId) {
    throw new ApiError(
      400,
      "You cannot create a conversation with yourself"
    );
  }

  const otherUser = await prisma.user.findUnique({
    where: {
      id: data.userId,
    },
    select: {
      id: true,
    },
  });

  if (!otherUser) {
    throw new ApiError(404, "User not found");
  }

  const directKey = [currentUserId, data.userId]
    .sort()
    .join("_");

  const existingConversation =
    await prisma.conversation.findUnique({
      where: {
        directKey,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

  if (existingConversation) {
    return existingConversation;
  }

  const conversation = await prisma.conversation.create({
    data: {
      type: "DIRECT",
      directKey,

      members: {
        create: [
          {
            userId: currentUserId,
            role: "MEMBER",
          },
          {
            userId: data.userId,
            role: "MEMBER",
          },
        ],
      },
    },

    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      },
    },
  });

  return conversation;
}

export async function markConversationAsRead(
  conversationId: string,
  userId: string
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

  return prisma.conversationMember.update({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
    data: {
      lastReadAt: new Date(),
    },
  });
}

