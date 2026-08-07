import { prisma } from "@/lib/prisma";



export async function getUserById(id: string) {
    return prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true,
      },
    });
  }

  