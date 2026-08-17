import { NextRequest, NextResponse } from "next/server";
import {
  generateAccessToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "@/services/token.service";
import { setAccessTokenCookie } from "@/lib/auth-cookie";

export function proxy(request: NextRequest) {
  const accessToken =
    request.cookies.get("accessToken")?.value;

  const refreshToken =
    request.cookies.get("refreshToken")?.value;

  // 1. Access token exists and is valid
  if (accessToken) {
    try {
      verifyAccessToken(accessToken);

      return NextResponse.next();
    } catch {
      // Access token is expired/invalid.
      // Continue to refresh-token logic.
    }
  }

  // 2. Try to refresh the access token
  if (refreshToken) {
    try {
      const payload = verifyRefreshToken(refreshToken);

      if(payload){
      const newAccessToken = generateAccessToken(
        payload.sub
      );

      const response = NextResponse.next();

      setAccessTokenCookie(
        response,
        newAccessToken
      );

      return response;
    }
    } catch {
      // Refresh token is also invalid/expired.
    }
  }

  // 3. Authentication failed
  return NextResponse.redirect(
    new URL("/login", request.url)
  );
}

export const config = {
  matcher: ["/chat/:path*"],
};