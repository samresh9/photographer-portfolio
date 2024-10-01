import path from "path";
import asyncHandler from "../utils/asyncHandler";
import { Request, Response } from "express";
import { Image, User } from "@prisma/client";
import prisma from "../config/prisma";
import { sendResponse } from "../utils/apiResponse";
import { StatusCodes } from "http-status-codes";
import { NotFoundError } from "../errors/NotFoundError";
import { UnAuthorizedError } from "../errors/UnAuthorizedError";
import fs from "node:fs";
import logger from "../utils/logger";
declare module "express" {
  interface Request {
    user?: Partial<User>;
  }
}

export const createAlbum = asyncHandler(
  async (req: Request & { files?: Express.Multer.File[] }, res) => {
    const { title, description } = req.body;
    const folderName = req?.files[0]?.destination.split(path.sep).pop();
    const userId = req?.user?.id;

    const album = await prisma.album.create({
      data: {
        title,
        description,
        userId,
        folderName,
      },
    });

    const images = req.files.map((file: Express.Multer.File) => ({
      albumId: album.id,
      imageUrl: `${folderName}/${file.filename}`, // Store the file path of each image
    }));

    await prisma.image.createMany({ data: images });
    const albumWithImage = await prisma.album.findFirst({
      where: {
        id: album.id,
      },
      include: { images: true },
    });
    sendResponse(res, StatusCodes.CREATED, "Album Crearted", albumWithImage);
  },
);

export const updateAlbum = asyncHandler(
  async (req: Request & { files?: Express.Multer.File[] }, res: Response) => {
    const { albumId } = req.params;
    const { title, description, imagesToRemove } = req.body;

    const newFiles = req.files || [];

    const album = await prisma.album.findUnique({
      where: { id: parseInt(albumId) },
      include: { user: true },
    });
    const userId = req.user?.id;
    if (!album) {
      throw new NotFoundError("Album not found.");
    }

    if (album.userId !== userId) {
      throw new UnAuthorizedError(
        "You are not authorized to update this album.",
      );
    }
    await prisma.album.update({
      where: { id: parseInt(albumId) },
      data: {
        title,
        description,
      },
    });

    if (imagesToRemove.length > 0) {
      await removeImagesFromAlbum(album.id, imagesToRemove);
    }

    if (newFiles.length) {
      const images = req?.files.map((file: Express.Multer.File) => ({
        albumId: album.id,
        imageUrl: file.filename, // Store the file path of each image
      }));
      await prisma.image.createMany({ data: images });
    }
    const updatedAlbum = await prisma.album.findFirst({
      where: {
        id: album.id,
      },
      include: { images: true },
    });
    sendResponse(res, StatusCodes.OK, "Album updated", updatedAlbum);
  },
);

const removeImagesFromAlbum = async (
  albumId: number,
  imagesToRemoveIds: number[],
) => {
  const existingImages = await prisma.image.findMany({
    where: {
      albumId: albumId,
      id: { in: imagesToRemoveIds },
    },
  });

  if (existingImages.length > 0) {
    await prisma.image.deleteMany({
      where: {
        id: { in: existingImages.map((image) => image.id) },
      },
    });
  }
  //Unlink (delete) image files from storage using the unified function
  unlinkImages(existingImages);
};

export const deleteAlbum = asyncHandler(async (req: Request, res: Response) => {
  const { albumId } = req.params;

  const album = await prisma.album.findUnique({
    where: { id: parseInt(albumId) },
    include: { images: true },
  });

  if (!album) {
    throw new NotFoundError("Album not found.");
  }

  // Unlink image files before deleting the album using the unified function
  unlinkImages(album.images);

  await prisma.album.delete({
    where: { id: parseInt(albumId) },
  });

  res.status(200).json({ message: "Album deleted successfully." });
});

const unlinkImages = (images: Image[]) => {
  const filePaths = images.map((image) =>
    path.join(__dirname, "..", "..", "uploads", image.imageUrl),
  );

  filePaths.forEach((filePath) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        logger.error(`Failed to delete local file ${filePath}:`, err);
      }
    });
  });
};
