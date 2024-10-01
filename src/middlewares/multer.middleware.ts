import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import prisma from "../config/prisma";
import { NotFoundError } from "../errors/NotFoundError";
import crypto from "node:crypto";
import { Album } from "@prisma/client";
import { Request } from "express";
import { BadRequestError } from "../errors/BadRequestError";

declare module "express" {
  interface Request {
    uploadDir?: string;
  }
}

const generateRandomString = (length: number): string => {
  // Generate random bytes
  const buffer = crypto.randomBytes(Math.ceil(length / 2));
  // Convert bytes to hexadecimal string
  const randomString = buffer.toString("hex").substring(0, length);
  return randomString;
};

const getFolderName = async (albumId: string): Promise<Album> => {
  const album = await prisma.album.findUnique({
    where: { id: parseInt(albumId) },
  });

  if (!album) {
    throw new NotFoundError("Album not found");
  }
  return album;
};

const storage = multer.diskStorage({
  destination: async (req: Request, file, cb) => {
    const albumId = req?.params?.albumId;
    let dir: string;
    if (albumId) {
      const album = await getFolderName(albumId);
      dir = path.join(__dirname, "../uploads", album.folderName);
    } else {
      if (!req.uploadDir) {
        const folderName = generateRandomString(15);
        dir = path.join(__dirname, "../uploads", folderName);
        fs.mkdirSync(dir, { recursive: true });
        req.uploadDir = dir;
      } else {
        dir = req.uploadDir;
      }
    }

    cb(null, dir);
  },

  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`,
    ); // Unique filename
  },
});

const validateFiles = async (files: Express.Multer.File[], _req: Request) => {
  const acceptedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/bmp",
  ];

  for (const file of files) {
    if (!acceptedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestError(
        `File ${file.fieldname} is not allowed. Only JPEG, PNG, GIF, and BMP images are permitted.`,
      );
    }
  }

  // If all files pass validation, proceed with upload
  return true;
};
// // File filter to validate image types
// const fileFilter = (req: Request, file: Express.Multer.File, cb) => {
//   const acceptedMimeTypes = [
//     "image/jpeg",
//     "image/png",
//     "image/gif",
//     "image/bmp",
//   ];

//   if (acceptedMimeTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(
//       new BadRequestError(
//         "Invalid file type. Only JPEG, PNG, GIF, and BMP are allowed.",
//       ),
//       false,
//     );
//   }
// };

// Initialize multer with storage and file filter
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit files to 5MB
  fileFilter: async (req: Request, file: Express.Multer.File, cb) => {
    try {
      const isValid = await validateFiles([file], req);
      if (!isValid) {
        throw new BadRequestError(
          `File ${file.fieldname} is not allowed. Only JPEG, PNG, GIF, and BMP images are permitted.`,
        );
      }
      cb(null, true);
    } catch (error) {
      cb(error, false);
    }
  },
  storage: storage,
});

export const uploadSingle = upload.single("image");
export const uploadMultiple = upload.array("images", 10);
