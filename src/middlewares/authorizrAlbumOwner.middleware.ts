import { NextFunction, Request, Response } from "express";
import prisma from "../config/prisma";
import { NotFoundError } from "../errors/NotFoundError";
import { ForbiddenError } from "../errors/ForbiddenError";
import asyncHandler from "../utils/asyncHandler";

export const authorizeAlbumOwner = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { albumId } = req.params;
    const userId = req.user?.id;

    const album = await prisma.album.findUnique({
      where: { id: parseInt(albumId) },
      include: { user: true },
    });

    if (!album) {
      throw new NotFoundError("Album not found.");
    }

    if (album.userId !== userId) {
      throw new ForbiddenError("You are not authorized to access this album.");
    }

    next();
  },
);
