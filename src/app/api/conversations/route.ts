import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { ApiError } from "@/lib/api-error";
import { handleApiError } from "@/lib/error-handler";
import { getAuthenticatedUser } from "@/services/auth.service";
import { createDirectConversation, getUserConversations } from "@/services/conversation.service";
import { validateRequest } from "@/lib/validate-request";
import { createConversationSchema } from "@/shared/schemas/conversation/create-conversation.schema";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const accessToken =
      cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      throw new ApiError(401, "Unauthorized");
    }

    const user = await getAuthenticatedUser(accessToken);

    const conversations = await getUserConversations(user.id);

    return NextResponse.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.log("error", error)
    return handleApiError(error);
  }
}

export async function POST(request: Request){

  try {

  const cookieStore = await cookies();

    const accessToken =
      cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id :currentUserId} = await getAuthenticatedUser(accessToken);

    const data = await validateRequest(request, createConversationSchema)

    const conversation = await createDirectConversation(currentUserId, data)
    return NextResponse.json({
      success: true,
      message:"Chat created Successfully",
      data: conversation,
    },{
      status:201
    });
  } catch (error) {
    console.log("error", error)
    return handleApiError(error);


  }

}