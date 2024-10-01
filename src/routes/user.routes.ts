import express from "express";
import {
  forgotPassword,
  logIn,
  resetPassword,
  signUp,
} from "../controllers/user.controller";
import { validate } from "../middlewares/validation.middleware";
import {
  forgotPasswordSchema,
  passwordResetSchema,
  userCreateSchema,
  userLoginSchema,
} from "../utils/validationSchema";

const router = express.Router();

router.route("/signup").post(validate(userCreateSchema), signUp);
router.route("/login").post(validate(userLoginSchema), logIn);
router
  .route("/forgot-password")
  .post(validate(forgotPasswordSchema), forgotPassword);
router
  .route("/reset-password/:token")
  .post(validate(passwordResetSchema), resetPassword);

export default router;
