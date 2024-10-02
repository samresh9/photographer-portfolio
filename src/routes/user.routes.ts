/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /api/v1/users/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - firstname
 *               - lastname
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request, user with this email already exists
 */

/**
 * @swagger
 * /api/v1/users/login:
 *   post:
 *     summary: User login
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful, returns access token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       400:
 *         description: Invalid credentials
 *       404:
 *         description: User with given email not found
 */

/**
 * @swagger
 * /api/v1/users/forgot-password:
 *   post:
 *     summary: Request password reset link
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       201:
 *         description: Password reset URL sent successfully
 *       400:
 *         description: User with this email does not exist
 */

/**
 * @swagger
 * /api/v1/users/reset-password/{token}:
 *   post:
 *     summary: Reset password using a token
 *     tags: [Users]
 *     parameters:
 *       - name: token
 *         in: path
 *         required: true
 *         description: The password reset token
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: The new password for the user
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 *       404:
 *         description: User not found
 */

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
