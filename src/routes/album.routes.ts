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

router
  .route("/")
  .post(authenticateToken, uploadMultiple, validate(albumSchema), createAlbum)
  .get(
    authenticateToken,
    validate(albumFilterSchema, RequestSourceEnum.QUERY),
    getAllAlbums,
  );
router
  .route("/:albumId")
  .get(authenticateToken, getAlbum)
  .put(
    authenticateToken,
    authorizeAlbumOwner,
    uploadMultiple,
    validate(albumUpdateSchema),
    updateAlbum,
  )
  .delete(authenticateToken, authorizeAlbumOwner, deleteAlbum);
export default router;
