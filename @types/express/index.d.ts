import { JwtPayload } from "jsonwebtoken";
import { User } from "@prisma/client";
import { Request } from "express";

export interface Payload extends JwtPayload {
  id: number;
}

declare module "express" {
  interface Request {
    user?: Partial<User>;
    uploadDir?: string;
  }
}
