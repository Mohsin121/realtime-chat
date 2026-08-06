export class ApiError extends Error {
    constructor(
      public statusCode: number,
      message: string,
      public errors?: Record<string, string[] | undefined>
    ) {
      super(message);
    }
  }
  
  export class ValidationError extends ApiError {
    constructor(errors: Record<string, string[] | undefined>) {
      super(400, "Validation failed", errors);
    }
  }
  
  export class UnauthorizedError extends ApiError {
    constructor(message = "Unauthorized") {
      super(401, message);
    }
  }
  
  export class NotFoundError extends ApiError {
    constructor(message = "Resource not found") {
      super(404, message);
    }
  }