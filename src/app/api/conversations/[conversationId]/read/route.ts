import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/services/auth.service";
import {
  markConversationAsRead,
} from "@/services/conversation.service";

import { ApiError } from "@/lib/api-error";
import { handleApiError } from "@/lib/error-handler";

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      conversationId: string;
    }>;
  }
) {
  try {
    const cookieStore = await cookies();

    const accessToken =
      cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      throw new ApiError(
        401,
        "Unauthorized"
      );
    }

    const { id: userId } =
      await getAuthenticatedUser(
        accessToken
      );

    const { conversationId } =
      await params;

    await markConversationAsRead(
      conversationId,
      userId
    );

    return NextResponse.json({
      success: true,
      message:
        "Conversation marked as read",
    });
  } catch (error) {
    return handleApiError(error);
  }
}