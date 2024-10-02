import jwt, { JwtPayload } from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler";
import path from "path";
import fs from "fs";
import { NotFoundError } from "../errors/NotFoundError";
import { Request, Response } from "express";

export const accessFile = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const token = req.query.token as string;

    if (!token) {
      return res.status(403).send("Access denied. No token provided.");
    }

    const decoded = jwt.verify(
      token,
      process.env.FILE_SERVE_SECRET_KEY,
    ) as JwtPayload;

    const filePath = decoded.path;
    const absolutePath = path.join(__dirname, "..", filePath);
    if (fs.existsSync(absolutePath)) {
      // Serve the file securely
      res.sendFile(absolutePath);
    } else {
      throw new NotFoundError("File not found.");
    }
  },
);

export const generateSignedUrl = (filepath: string) => {
  const path = `uploads/${filepath}`; // Example file
  const token = jwt.sign({ path }, process.env.FILE_SERVE_SECRET_KEY);
  const signedUrl = `http://localhost:3000/access-file?token=${token}`;
  return signedUrl;
};
