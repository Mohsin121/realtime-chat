import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/validate-request";
import { loginSchema } from "@/shared/schemas/auth/login.schema";
import { handleApiError } from "@/lib/error-handler";
import { login } from "@/services/auth.service";
import { generateAccessToken, generateRefreshToken } from "@/services/token.service";
import { setAccessTokenCookie, setRefreshTokenCookie } from "@/lib/auth-cookie";

export async function POST(request: Request) {
  try {
    const data = await validateRequest(
      request,
      loginSchema
    );
    
    const user = await login(data);
    const accessToken = generateAccessToken(user.id);
    const refreshToken= generateRefreshToken(user.id)

    const response =  NextResponse.json(
      {
        success: true,
        message: "Login successful",
        data:user,
      },
      {
        status: 200,
      }
    );

     setAccessTokenCookie(response, accessToken)

     setRefreshTokenCookie(response, refreshToken)

    return response;

  } catch (error) {
    return handleApiError(error);
  }
}