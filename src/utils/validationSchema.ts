import { z } from "zod";

export const userCreateSchema = z.object({
  email: z.string().email("Invalid Email format"),
  firstname: z.string().min(2, { message: "First name is required" }),
  lastname: z.string().min(1, { message: "Last name is required" }),
  password: z
    .string()
    .min(7, "Password must be at least 7 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{7,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    ),
});

export const userLoginSchema = z.object({
  email: z.string().email("Invalid Email format"),
  password: z.string().min(1, { message: "Password is required" }),
});
