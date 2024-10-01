import { StatusCodes } from "http-status-codes";

export class ForbiddenError extends Error {
  public statusCode: number;
  constructor(message?: string) {
    super(message || "Forbidden");
    this.statusCode = StatusCodes.FORBIDDEN;
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}
