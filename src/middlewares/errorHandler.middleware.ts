import { StatusCodes } from "http-status-codes";
import logger from "../utils/logger";

const handleNotFound = (req, res, next) => {
  const error: any = new Error(`Not Found ${req.method} ${req.originalUrl}`);
  error.statusCode = StatusCodes.NOT_FOUND;
  res.statusCode = StatusCodes.NOT_FOUND;
  next(error);
};

const globalErrorHandler = (err: any, _req, res, _next) => {
  const { code, message, errors, stack } = err;
  logger.error(err);
  const timestamp = new Date().toISOString();
  const statusCode = err?.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR;
  res.statusCode = statusCode;

  const errorRes: any = {
    statusCode: statusCode,
    message,
    status: false,
    timestamp,
  };

  if (process.env.NODE_ENV === "development") {
    errorRes.stack = stack;
  }

  if (code) {
    errorRes.code = code;
  }

  if (errors) {
    errorRes.errors = errors;
  }

  if (res.statusCode === StatusCodes.INTERNAL_SERVER_ERROR) {
    errorRes.message = "Internal Server Error.";
  }

  res.send(errorRes);
};

export { globalErrorHandler, handleNotFound };
