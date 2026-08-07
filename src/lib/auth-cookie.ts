// lib/auth-cookie.ts

import { NextResponse } from "next/server";
const FIFTEEN_MINUTES = 60 * 15;
const SEVEN_DAYS = 60 * 60 * 24 * 7;

export function setAccessTokenCookie(
    response: NextResponse,
    token: string
  ) {
    response.cookies.set({
      name: "accessToken",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: FIFTEEN_MINUTES,
    });
  }

  export function setRefreshTokenCookie(
    response: NextResponse,
    token: string
  ) {
    response.cookies.set({
      name: "refreshToken",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: SEVEN_DAYS,
    });
  }


  export function clearAuthCookies(response: NextResponse) {
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
  }