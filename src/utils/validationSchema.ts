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
  firstname: z
    .string()
    .min(2, { message: "First name is required" })
    .transform((userName) => `Hi, ${userName}`),
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
  title: z.string(),
  description: z.string().optional(),
  imagesToRemove: z.string().transform(transformFormDataToNumbers),
});
