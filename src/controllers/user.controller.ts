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
