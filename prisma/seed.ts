import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import logger from "../src/utils/logger";
const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminFirstName = "Admin";
  const adminLastName = "User";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstname: adminFirstName,
        lastname: adminLastName,
      },
    });

    logger.info("Admin user created!");
  } else {
    logger.info("Admin user already exists.");
  }
}

main()
  .catch((e) => {
    logger.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
