import { z } from "zod";

export const createConversationSchema = z.object({
  userId: z.string().uuid(),
});

export type CreateConversationDto = z.infer<
  typeof createConversationSchema
>;