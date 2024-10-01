import { NextFunction, Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { UnAuthorizedError } from "../errors/UnAuthorizedError";
import * as jwt from "jsonwebtoken";
import { Payload } from "../../@types/express";
import prisma from "../config/prisma";
import { User } from "@prisma/client";

declare module "express" {
  interface Request {
    user?: Partial<User>;
  }
}
export const authenticateToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      throw new UnAuthorizedError();
    }
    try {
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
      ) as Payload;

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      req.user = user;
      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnAuthorizedError("Invalid token");
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnAuthorizedError("Token expired");
      }

      // For any other errors, you can choose to handle them differently or rethrow
      throw new UnAuthorizedError("Authentication failed");
    }
  },
);
