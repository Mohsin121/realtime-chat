import { ApiError } from "@/lib/api-error";
import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
type TokenPayload = {
  sub: string;
};

export function generateAccessToken(userId: string) {
  return jwt.sign(
    {
      sub: userId,
    },
    ACCESS_SECRET,
    {
      expiresIn: "15m",
    }
  );
}

export function generateRefreshToken(userId: string) {
  return jwt.sign(
    {
      sub: userId,
    },
    REFRESH_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

export function verifyAccessToken(token: string) {
  try {
    const payload = jwt.verify(token, ACCESS_SECRET);

    if (
      typeof payload === "string" ||
      !payload.sub
    ) {
      throw new Error();
    }

    return {
      sub: payload.sub as string,
    };
  } catch {
    return null;
  }
}



export function verifyRefreshToken(token: string): TokenPayload | null{
  try {
    const payload = jwt.verify(token, REFRESH_SECRET);

    if (
      typeof payload === "string" ||
      !payload.sub
    ) {
      throw new Error();
    }

    return {
      sub: payload.sub as string,
    };
  } catch {
    return null;
  }
}