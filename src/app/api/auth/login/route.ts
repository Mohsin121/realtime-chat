import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/validate-request";
import { loginSchema } from "@/validators/auth/login.schema";
import { handleApiError } from "@/lib/error-handler";
import { login } from "@/services/auth.service";
import { generateAccessToken } from "@/services/token.service";

export async function POST(request: Request) {
  try {
    const data = await validateRequest(
      request,
      loginSchema
    );
    
    const user = await login(data);
    const accessToken = generateAccessToken(user.id);

    const response =  NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user,
      },
      {
        status: 200,
      }
    );

    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000,
      path: "/",
    });
    return response;

  } catch (error) {
    return handleApiError(error);
  }
}