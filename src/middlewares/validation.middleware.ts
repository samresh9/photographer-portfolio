import { type AnyZodObject } from "zod";
import { type Request, type Response, type NextFunction } from "express";
import asyncHandler from "../utils/asyncHandler";
import { ValidationError } from "../errors/ValidationError";
import { RequestSourceEnum } from "../common/commant.constants";

const validate = (
  schema: AnyZodObject,
  source: RequestSourceEnum = RequestSourceEnum.BODY,
) => {
  return asyncHandler((req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

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
    req[source] = result.data;
    next();
  });
};

export { validate };
