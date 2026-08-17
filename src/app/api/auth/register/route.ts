import { handleApiError } from "@/lib/error-handler";
import { validateRequest } from "@/lib/validate-request";
import { register } from "@/services/auth.service";
import { registerSchema } from "@/shared/schemas/auth/register.schema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
      const data = await validateRequest(
        request,
        registerSchema
      );
      const user = await register(data);
  
      return NextResponse.json(
        {
          success: true,
          data: user,
        },
        {
          status: 201,
        }
      );
    } catch (error) {
      return handleApiError(error);
    }
  }