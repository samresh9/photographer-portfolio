import { StatusCodes } from "http-status-codes";

export class BadRequestError extends Error {
  public statusCode: number;
  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.BAD_REQUEST;
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}
