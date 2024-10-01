import crypto from "node:crypto";

export const generateRandomString = (length: number): string => {
  const buffer = crypto.randomBytes(Math.ceil(length / 2));
  // Convert bytes to hexadecimal string
  const randomString = buffer.toString("hex").substring(0, length);
  return randomString;
};
