import path from "path";
import asyncHandler from "../utils/asyncHandler";
import { Request, Response } from "express";
import { Image, Prisma, User } from "@prisma/client";
import prisma from "../config/prisma";
import { sendResponse } from "../utils/apiResponse";
import { StatusCodes } from "http-status-codes";
import { NotFoundError } from "../errors/NotFoundError";
import { UnAuthorizedError } from "../errors/UnAuthorizedError";
import fs from "fs/promises";
import { paginationMetadata } from "../utils/paginationMetadata";

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

  // Delete the folder and its contents
  await deleteFolder(album.folderName);

  await prisma.album.delete({
    where: { id: parseInt(albumId) },
  });

  sendResponse(res, StatusCodes.OK, "Album deleted successfully.", true);
});

const unlinkImages = async (images: Image[]) => {
  const filePaths = images.map((image) =>
    path.join(__dirname, "..", "uploads", image.imageUrl),
  );

  for (const filePath of filePaths) {
    await fs.unlink(filePath);
  }
};

const deleteFolder = async (folderName: string) => {
  const folderPath = path.join(__dirname, "..", "uploads", folderName);
  await fs.rm(folderPath);
};

export const getAllAlbums = asyncHandler(
  async (req: Request, res: Response) => {
    const { page, limit, includeOthers, search } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const userId = req.user?.id;

    const whereCondition: Prisma.AlbumWhereInput = {
      ...(includeOthers === "true" ? {} : { userId }),
      ...(search
        ? {
            OR: [
              { title: { contains: String(search), mode: "insensitive" } },
              {
                description: { contains: String(search), mode: "insensitive" },
              },
            ],
          }
        : {}),
    };

    const paginatedResult = await prisma.album.findMany({
      where: whereCondition,
      skip: offset,
      take: Number(limit),
    });

    const totalAlbums = await prisma.album.count({ where: whereCondition });
    const metadata = paginationMetadata(
      totalAlbums,
      Number(limit),
      Number(page),
    );
    const data = { paginatedResult, metadata };

    sendResponse(res, StatusCodes.OK, "Success", data);
  },
);

export const getAlbum = asyncHandler(async (req: Request, res: Response) => {
  const { albumId } = req.params;
  const album = await prisma.album.findUnique({
    where: { id: parseInt(albumId) },
    include: { user: true, images: true },
  });

  if (!album) {
    throw new NotFoundError("Album not found.");
  }
  sendResponse(res, StatusCodes.OK, "Success", album);
});
