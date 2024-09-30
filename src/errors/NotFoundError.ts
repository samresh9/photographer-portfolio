import { StatusCodes } from "http-status-codes";

export class NotFoundError extends Error {
  public statusCode: number;
  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.NOT_FOUND;
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
