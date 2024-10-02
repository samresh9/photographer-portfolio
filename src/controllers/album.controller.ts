import path from "path";
import asyncHandler from "../utils/asyncHandler";
import { Request, Response } from "express";
import { Image, Prisma } from "@prisma/client";
import prisma from "../config/prisma";
import { sendResponse } from "../utils/apiResponse";
import { StatusCodes } from "http-status-codes";
import { NotFoundError } from "../errors/NotFoundError";
import { UnAuthorizedError } from "../errors/UnAuthorizedError";
import fs from "fs/promises";
import { paginationMetadata } from "../utils/paginationMetadata";
import { generateSignedUrl } from "./file.controller";
import { generateRandomString } from "../utils/randomTokenGenerator";

export const createAlbum = asyncHandler(
  async (req: Request & { files?: Express.Multer.File[] }, res) => {
    const { title, description } = req.body;
    const userId = req?.user?.id;
    const folderName = `${generateRandomString(15)}-${userId}`;
    // Start a transaction
    const transaction = await prisma.$transaction(async (tx) => {
      // Step 1: Create the album
      const album = await tx.album.create({
        data: {
          title,
          description,
          userId,
          folderName: folderName,
        },
      });

      // Step 2: Save the uploaded files
      const dir = path.join(__dirname, "../uploads", album.folderName);
      const filePaths = await saveFiles(req.files, dir); // Assuming saveFiles is defined as in the previous answer

      // Step 3: Create image records
      const images = filePaths.map((filePath: string) => ({
        albumId: album.id,
        imageUrl: `${album.folderName}/${path.basename(filePath)}`,
      }));

      await tx.image.createMany({ data: images });

      return album; // Return the created album
    });

    // Fetch the album with images to return
    const albumWithImages = await prisma.album.findFirst({
      where: {
        id: transaction.id,
      },
      include: { images: true },
    });

    // Send response
    sendResponse(res, StatusCodes.CREATED, "Album Created", albumWithImages);
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

    if (imagesToRemove?.length > 0) {
      await removeImagesFromAlbum(album.id, imagesToRemove);
    }

    if (newFiles.length) {
      const dir = path.join(__dirname, "../uploads", album.folderName);
      const filePaths = await saveFiles(req.files, dir);
      const images = filePaths.map((filePath: string) => ({
        albumId: album.id,
        imageUrl: `${album.folderName}/${path.basename(filePath)}`,
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
  await fs.rm(folderPath, { recursive: true });
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

  const imagesWithUrl = album.images.map((image) => {
    const preSignedUrl = generateSignedUrl(image.imageUrl);
    return { ...image, imageUrl: preSignedUrl };
  });

  album.images = imagesWithUrl;
  sendResponse(res, StatusCodes.OK, "Success", album);
});

const saveFiles = async (
  files: Express.Multer.File[],
  dir: string,
): Promise<string[]> => {
  await fs.mkdir(dir, { recursive: true });
  const filePaths = await Promise.all(
    files.map(async (file) => {
      const filePath = path.join(dir, `${Date.now()}-${file.originalname}`);
      await fs.writeFile(filePath, file.buffer);
      return filePath;
    }),
  );
  return filePaths;
};
