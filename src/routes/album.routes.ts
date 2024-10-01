import express from "express";
import { createAlbum, updateAlbum } from "../controllers/album.controller";
import { uploadMultiple } from "../middlewares/multer.middleware";
import { authenticateToken } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import { albumSchema, albumUpdateSchema } from "../utils/validationSchema";
import { authorizeAlbumOwner } from "../middlewares/authorizrAlbumOwner.middleware";

const router = express.Router();

router
  .route("/")
  .post(authenticateToken, uploadMultiple, validate(albumSchema), createAlbum);
router
  .route("/:albumId")
  .put(
    authenticateToken,
    authorizeAlbumOwner,
    uploadMultiple,
    validate(albumUpdateSchema),
    updateAlbum,
  )
  .delete(authenticateToken, authorizeAlbumOwner);
export default router;
