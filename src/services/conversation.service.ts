import { ApiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { CreateConversationDto } from "@/shared/schemas/conversation/create-conversation.schema";


export async function getUserConversations(
  currentUserId: string
) {
  const conversations =
    await prisma.conversation.findMany({
      where: {
        members: {
          some: {
            userId: currentUserId,
          },
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

        messages: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            conversationId: true,
            senderId: true,
            content: true,
            type: true,
            createdAt: true,
          },
        },
      },

      orderBy: {
        lastMessageAt: "desc",
      },
    });

  return conversations.map((conversation) => {
    const otherMember =
      conversation.type === "DIRECT"
        ? conversation.members.find(
            (member) =>
              member.userId !== currentUserId
          )
        : null;

    return {
      id: conversation.id,
      type: conversation.type,

      name: conversation.name,
      avatar: conversation.avatar,

      otherUser: otherMember?.user?? null,
      lastMessage:
        conversation.messages[0]
          ? {
              ...conversation.messages[0],
              createdAt:
                conversation.messages[0].createdAt.toISOString(),
            }
          : null,
    };
  });
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

