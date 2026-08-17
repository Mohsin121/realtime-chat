import { NextResponse } from "next/server";
import { ApiError } from "@/lib/api-error";
import { handleApiError } from "@/lib/error-handler";
import { getAuthenticatedUser } from "@/services/auth.service";
import { cookies } from "next/headers";
import { createMessage, getConversationMessages } from "@/services/message.service";
import { validateRequest } from "@/lib/validate-request";
import { createMessageSchema } from "@/shared/schemas/message/create-message.schema";

interface RouteContext {
  params: Promise<{
    conversationId: string;
  }>;
}

export async function GET(
  request: Request,
  { params }: RouteContext
) {
  try {
    const cookieStore = await cookies();

    const accessToken =
      cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      throw new ApiError(401, "Unauthorized");
    }

    const user = await getAuthenticatedUser(accessToken);

    const { conversationId } = await params;

    if (!conversationId) {
      throw new ApiError(
        400,
        "Conversation ID is required"
      );
    }

    const messages = await getConversationMessages(
      conversationId,
      user.id
    );

    return NextResponse.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.log("eorrrrr", error)
    return handleApiError(error);
  }
}

export async function POST(
    request: Request,
    { params }: RouteContext
  ) {
    try {
        const cookieStore = await cookies();

    const accessToken =
      cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      throw new ApiError(401, "Unauthorized");
    }

    const user = await getAuthenticatedUser(accessToken);
      const { conversationId } = await params;
  
      if (!conversationId) {
        throw new ApiError(
          400,
          "Conversation ID is required"
        );
      }
  
      const data = await validateRequest(
        request,
        createMessageSchema
      );
  
      const message = await createMessage(
        conversationId,
        user.id,
        data
      );
  
      return NextResponse.json(
        {
          success: true,
          message: "Message sent successfully",
          data: message,
        },
        {
          status: 201,
        }
      );
    } catch (error) {
      return handleApiError(error);
    }
}