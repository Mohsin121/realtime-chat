import { User } from "@prisma/client";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET! || "asdd234@#3rad";

export function generateAccessToken(userId: Pick<User, "id">["id"]) {
  return jwt.sign(
    {
      sub:userId,
    },
    JWT_SECRET,
    {
      expiresIn: "15m",
    }
  );
}