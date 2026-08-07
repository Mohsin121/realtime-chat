import { ApiError } from "@/lib/api-error";
import { setAccessTokenCookie } from "@/lib/auth-cookie";
import { handleApiError } from "@/lib/error-handler";
import { generateAccessToken, verifyRefreshToken } from "@/services/token.service";
import { getUserById } from "@/services/user.service";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";



export async function POST() {

  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;
    if (!refreshToken) {
      throw new ApiError(401, "Unauthorized")
    }

    const payload = verifyRefreshToken(refreshToken);
    const user = await getUserById(payload.sub)

    if (!user) {
      throw new ApiError(401, "Unauthorized")
    }

    const accessToken = generateAccessToken(user.id);
    const response = NextResponse.json(
      {
        success: true,
        message: "Access token refreshed successfully",
      },
      {
        status: 200,
      }
    );

    setAccessTokenCookie(response, accessToken);

    return response;
  } catch (error) {
    return handleApiError(error)
  }

} 