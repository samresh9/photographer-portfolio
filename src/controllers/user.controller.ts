import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { userCreateSchema, userLoginSchema } from "../utils/validationSchema";
import { z } from "zod";
import { BadRequestError } from "../errors/BadRequestError";
import bcrypt from "bcrypt";
import prisma from "../config/prisma";
import asyncHandler from "../utils/asyncHandler";
import { sendResponse } from "../utils/apiResponse";
import { NotFoundError } from "../errors/NotFoundError";
import * as jwt from "jsonwebtoken";
import { generateRandomString } from "../utils/randomTokenGenerator";
import { sendEmail } from "../utils/sendEmail";
type UserCreateInput = z.infer<typeof userCreateSchema>;
type UserLoginInput = z.infer<typeof userLoginSchema>;

export const signUp = asyncHandler(async (req: Request, res: Response) => {
  const { email, firstname, lastname, password }: UserCreateInput = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new BadRequestError("User with this email already exists");
  }

  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data: {
      firstname,
      lastname,
      email,
      password: hashedPassword,
    },
  });

  sendResponse(res, StatusCodes.CREATED, "User registered succssfully", user);
});

export const logIn = asyncHandler(
  async (req: Request<UserLoginInput>, res: Response) => {
    const { email, password }: UserLoginInput = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        password: true,
      },
    });
    if (!existingUser) {
      throw new NotFoundError("User with given email not found.");
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password,
    );

    if (!isPasswordCorrect) {
      throw new BadRequestError("Invalid Credentials!");
    }
    const accessToken = generateAccessToken(existingUser.id);

    sendResponse(res, StatusCodes.OK, "Success", { accessToken });
  },
);

const generateAccessToken = (userId: number) => {
  const payload = {
    id: userId,
  };
  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
  return accessToken;
};

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new BadRequestError("User with this email does not exist.");
  }

  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id },
  });

  const token = generateRandomString(32);
  const calculateMillisecond = 60 * 60 * 1000; //1hrs
  const expiresAt = new Date(Date.now() + calculateMillisecond);
  await prisma.passwordResetToken.create({
    data: {
      token,
      expiresAt,
      userId: user.id,
    },
  });

  const resetLink = `${process.env.BASE_URL}/reset-password/${token}`;
  await sendEmail(user.email, user, resetLink);

  sendResponse(
    res,
    StatusCodes.CREATED,
    "Password resert url sent successfully.",
    true,
  );
});

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    const passwordResetToken = await prisma.passwordResetToken.findUnique({
      where: { token: token, expiresAt: { gte: new Date() } },
    });

    if (!passwordResetToken) {
      throw new BadRequestError("Invalid or expired token.");
    }

    const user = await prisma.user.findUnique({
      where: { id: passwordResetToken.userId },
    });

    if (!user) {
      throw new BadRequestError("User not found.");
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    await prisma.passwordResetToken.delete({
      where: { token },
    });

    sendResponse(res, StatusCodes.OK, "Password reset successful.", true);
  },
);
