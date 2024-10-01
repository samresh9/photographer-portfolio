import "dotenv/config";
import express, { Request, Response } from "express";
import prisma from "./config/prisma";
import serverRoutes from "./routes";
import {
  globalErrorHandler,
  handleNotFound,
} from "./middlewares/errorHandler.middleware";
import logger from "./utils/logger";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, !");
});

serverRoutes(app);

//Error Handler
app.use(handleNotFound);
app.use(globalErrorHandler);

prisma
  .$connect()
  .then(() => {
    logger.info("✅ Connected to the database successfully.");
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error("❌ Failed to connect to the DB", err.stack);
    process.exit(1);
  });
