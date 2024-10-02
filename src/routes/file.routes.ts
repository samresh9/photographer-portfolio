/**
 * @swagger
 * tags:
 *   name: Files
 *   description: Access files securely
 */

/**
 * @swagger
 * /api/v1/access-file:
 *   get:
 *     summary: Access a file securely
 *     tags: [Files]
 *     description: Retrieve a file using a signed token.
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         description: The token to access the file.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File retrieved successfully.
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       403:
 *         description: Access denied. No token provided.
 *       404:
 *         description: File not found.
 */

import express from "express";
import { accessFile } from "../controllers/file.controller";

const router = express.Router();

router.route("/").get(accessFile);

export default router;
