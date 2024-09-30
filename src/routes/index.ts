import { Express } from "express";
import userRoutes from "./user.routes";

const serverRoutes = (app: Express) => {
  app.use("/api/v1/users", userRoutes);
};

export default serverRoutes;
