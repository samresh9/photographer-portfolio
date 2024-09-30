import { StatusCodes } from "http-status-codes";

const handleNotFound = (req, res, next) => {
  const error: any = new Error(`Not Found ${req.method} ${req.originalUrl}`);
  error.statusCode = StatusCodes.NOT_FOUND;
  res.statusCode = StatusCodes.NOT_FOUND;
  next(error);
};

const globalErrorHandler = (err: any, _req, res, _next) => {
  console.log(err);
  const { code, message, errors, stack } = err;
  const timestamp = new Date().toISOString();
  res.statusCode = err?.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR;

  const errorRes: any = {
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
