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
        createdAt: true,
      },
    });
  }

  
  export async function searchUsers(query: string, currentUserId: string) {
    const users = await prisma.user.findMany({
      where: {
        id: { not: currentUserId }, // Exclude the current user
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
      take: 10,
    });
  
    return users;
  }