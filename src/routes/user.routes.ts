import express from "express";
import { logIn, signUp } from "../controllers/user.controller";
import { validate } from "../middlewares/validation.middleware";
import { userCreateSchema, userLoginSchema } from "../utils/validationSchema";

const router = express.Router();

router.route("/signup").post(validate(userCreateSchema), signUp);
router.route("/login").post(validate(userLoginSchema), logIn);
export default router;
