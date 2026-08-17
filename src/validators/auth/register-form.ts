import { z } from "zod";
import { registerSchema } from "@/shared/schemas/auth/register.schema";

export const registerFormSchema = registerSchema
  .extend({
    confirmPassword: z.string().min(6),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      path: ["confirmPassword"],
      message: "Passwords do not match",
    }
  );

export type RegisterFormValues = z.infer<
  typeof registerFormSchema
>;