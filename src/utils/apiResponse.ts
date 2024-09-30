import { Response } from "express";
import { StatusCodes } from "http-status-codes";

/**
 * Sends a JSON response to the client.
 *
 * @template T - The type of the data being sent in the response.
 * @param {Response} res - The Express response object.
 * @param {number} statusCode - The HTTP status code to send.
 * @param {string} message - A message describing the response.
 * @param {T} data - The data to include in the response.
 */

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data: T,
) => {
  res.status(statusCode).json({
    statusCode,
    status: statusCode < 400 ? "success" : "error",
    message,
    data,
  });
};
