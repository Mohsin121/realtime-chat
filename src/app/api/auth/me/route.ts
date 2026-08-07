import { ApiError } from "@/lib/api-error";
import { handleApiError } from "@/lib/error-handler";
import { getAuthenticatedUser } from "@/services/auth.service";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const accessToken =
      cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      throw new ApiError(
        401,
        "Unauthorized"
      );
    }

    const user = await getAuthenticatedUser(accessToken);

    return NextResponse.json(
      {
        success: true,
        data:user,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}