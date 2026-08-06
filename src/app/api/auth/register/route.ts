import { handleApiError } from "@/lib/error-handler";
import { validateRequest } from "@/lib/validate-request";
import { registerSchema } from "@/validators/auth/register.schema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
      const data = await validateRequest(
        request,
        registerSchema
      );
  
      return NextResponse.json({
        success: true,
        data,
      });
    } catch (error) {
      return handleApiError(error);
    }
  }