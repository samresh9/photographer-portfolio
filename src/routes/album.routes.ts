/**
 * @swagger
 * tags:
 *   name: Albums
 *   description: Album management
 */

/**
 * @swagger
 * /api/v1/albums:
 *   post:
 *     summary: Create a new album
 *     tags: [Albums]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - images
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Album created successfully
 */

/**
 * @swagger
 * /api/v1/albums:
 *   get:
 *     summary: Get all albums
 *     tags: [Albums]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: search
 *         in: query
 *         description: Search term to filter albums by title or description
 *         required: false
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         description: Page number for pagination
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: Number of albums per page (max 100)
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: includeOthers
 *         in: query
 *         description: Whether to include other users' albums
 *         required: false
 *         schema:
 *           type: string
 *           enum: [true, false]
 *           default: false
 *     responses:
 *       200:
 *         description: A list of albums retrieved successfully
 *       401:
 *         description: Unauthorized access
 */

/**
 * @swagger
 * /api/v1/albums/{albumId}:
 *   get:
 *     summary: Get an album by ID
 *     tags: [Albums]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: albumId
 *         in: path
 *         required: true
 *         description: The ID of the album to retrieve.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Album details retrieved successfully.
 *       404:
 *         description: Album not found.
 */

/**
 * @swagger
 * /api/v1/albums/{albumId}:
 *   put:
 *     summary: Update an existing album by ID
 *     tags: [Albums]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: albumId
 *         in: path
 *         required: true
 *         description: The ID of the album to update.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the album
 *               description:
 *                 type: string
 *                 description: The description of the album
 *               imagesToRemove:
 *                 type: array
 *                 description: A list of image IDs to be removed from the album
 *                 items:
 *                   type: integer
 *               images:
 *                 type: array
 *                 description: Array of files to upload and add to the album
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Album updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 images:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       imageUrl:
 *                         type: string
 *                         description: URL of the image in the album
 *       401:
 *         description: Unauthorized. You are not allowed to update this album.
 *       404:
 *         description: Album not found.
 */

/**
 * @swagger
 * /api/v1/albums/{albumId}:
 *   delete:
 *     summary: Delete an album by ID
 *     tags: [Albums]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: albumId
 *         in: path
 *         required: true
 *         description: The ID of the album to delete
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Album deleted successfully
 *       401:
 *         description: Unauthorized. You are not allowed to delete this album.
 *       404:
 *         description: Album not found
 */

import express from "express";
import {
  createAlbum,
  deleteAlbum,
  getAlbum,
  getAllAlbums,
  updateAlbum,
} from "../controllers/album.controller";
import { uploadMultiple } from "../middlewares/multer.middleware";
import { authenticateToken } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import {
  albumFilterSchema,
  albumSchema,
  albumUpdateSchema,
} from "../utils/validationSchema";
import { authorizeAlbumOwner } from "../middlewares/authorizrAlbumOwner.middleware";
import { RequestSourceEnum } from "../common/commant.constants";

const router = express.Router();

router.post(
  "/",
  authenticateToken,
  uploadMultiple,
  validate(albumSchema),
  createAlbum,
);

router.get(
  "/",
  authenticateToken,
  validate(albumFilterSchema, RequestSourceEnum.QUERY),
  getAllAlbums,
);

router.get("/:albumId", authenticateToken, getAlbum);

router.put(
  "/:albumId",
  authenticateToken,
  authorizeAlbumOwner,
  uploadMultiple,
  validate(albumUpdateSchema),
  updateAlbum,
);

router.delete("/:albumId", authenticateToken, authorizeAlbumOwner, deleteAlbum);

export default router;
