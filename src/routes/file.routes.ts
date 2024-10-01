import express from "express";
import { accessFile } from "../controllers/file.controller";

const router = express.Router();

router.route("/").get(accessFile);

export default router;
