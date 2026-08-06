import { ZodType } from "zod";
import { ValidationError } from "./api-error";

export async function validateRequest<T>(
  request: Request,
  schema: ZodType<T>
): Promise<T> {
  const body = await request.json();

  const result = schema.safeParse(body);

  if (!result.success) {
    throw new ValidationError(
        result.error.flatten().fieldErrors
    );
  }

  return result.data;
}