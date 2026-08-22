import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/services/auth.service";
import { ApiError } from "@/lib/api-error";
import { cookies } from "next/headers";
import { searchUsers } from "@/services/user.service";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();

    const accessToken =
      cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      throw new ApiError(401, "Unauthorized");
    }

    const user = await getAuthenticatedUser(accessToken);

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json([]);
    }
    const users = await searchUsers(query, user.id);

    return NextResponse.json(users);
  } catch (error) {
    console.error("SEARCH_USERS_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}