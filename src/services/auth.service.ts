import { ApiError, UnauthorizedError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { LoginDto } from "@/validators/auth/login.schema";
import { RegisterDto } from "@/validators/auth/register.schema";
import bcrypt from "bcrypt";

export async function register(data: RegisterDto) {

    const existingUser = await prisma.user.findUnique({
        where: {
          email: data.email,
        },
      });

      if (existingUser) {
        throw new ApiError(409, "Email already exists");
      }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
        data: {
            ...data,
            password: hashedPassword,
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

    return user;
}

export async function login(data: LoginDto) {
    const user = await prisma.user.findUnique({
        where: {
            email: data.email,
        },
        
    });
    if (!user) {
        throw new UnauthorizedError("Invalid email or password");
    }
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
        throw new UnauthorizedError("Invalid email or password");
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
}