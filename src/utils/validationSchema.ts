import { z } from "zod";

const transformFormDataToNumbers = (value: any) => {
  if (typeof value === "string" && value.includes(",")) {
    return value.split(",").map(Number);
  } else if (Array.isArray(value)) {
    return value.map(Number);
  } else if (value === null) {
    return value;
  } else {
    return [Number(value)];
  }
};

export const userCreateSchema = z.object({
  email: z.string().email("Invalid Email format").min(1),
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
  email: z.string().email("Invalid Email format").min(1),
  password: z.string().min(1, { message: "Password is required" }).min(1),
});

export const albumSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  description: z.string(),
});

export const albumUpdateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  imagesToRemove: z.string().transform(transformFormDataToNumbers).optional(),
});

export const albumFilterSchema = z.object({
  search: z.string().optional(),
  page: z
    .string()
    .default("1")
    .transform((val) => Number(val)),
  limit: z
    .string()
    .default("10")
    .transform((val) => Number(val))
    .refine((val) => val <= 100, {
      message: "Limit must be less than or equal to 100",
    }),
  includeOthers: z.enum(["true", "false"]).default("false"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid Email format").min(1),
});

export const passwordResetSchema = z.object({
  newPassword: z
    .string()
    .min(7, "Password must be at least 7 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{7,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    ),
});
