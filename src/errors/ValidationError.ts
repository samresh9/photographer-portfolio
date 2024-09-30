import { StatusCodes } from "http-status-codes";

export class ValidationError extends Error {
  public statusCode: number;
  public errors: any[];

  constructor(errors: any) {
    super("Validation Error");
    this.statusCode = StatusCodes.BAD_REQUEST;
    this.errors = errors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
