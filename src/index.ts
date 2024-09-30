import "dotenv/config";
import express, { Request, Response } from "express";
import prisma from "./config/prisma";
import serverRoutes from "./routes";
import {
  globalErrorHandler,
  handleNotFound,
} from "./middlewares/errorHandler.middleware";

const app = express();
const PORT = process.env.PORT || 3000;
console.log(PORT);
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
    console.log("✅ Connected to the database successfully.");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("❌ Failed to connect to the DB", err.stack);
    process.exit(1);
  });
