import { type AnyZodObject } from "zod";
import type { Request, Response, NextFunction } from "express";
import asyncHandler from "../utils/asyncHandler";
import { ValidationError } from "../errors/ValidationError";

const validate = (schema: AnyZodObject) => {
  return asyncHandler((req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors: Record<string, string[]> = {};
      result.error.issues.forEach((err) => {
        const field = err.path.join("");
        const message = err.message;

        if (!errors[field]) {
          errors[field] = [];
        }
        errors[field].push(message);
      });
      throw new ValidationError(errors);
    }
    req.body = result.data;
    next();
  });
};

export { validate };
