import { StatusCodes } from "http-status-codes";

export class UnAuthorizedError extends Error {
  public statusCode: number;
  constructor(message?: string) {
    super(message || "Unauthorized");
    this.statusCode = StatusCodes.UNAUTHORIZED;
    Object.setPrototypeOf(this, UnAuthorizedError.prototype);
  }
}
