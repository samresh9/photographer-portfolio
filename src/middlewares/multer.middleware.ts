import multer from "multer";
import { Request } from "express";
import { BadRequestError } from "../errors/BadRequestError";

declare module "express" {
  interface Request {
    uploadDir?: string;
  }
}

const storage = multer.memoryStorage();

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

  return true;
};

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
