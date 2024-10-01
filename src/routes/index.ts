import { Express } from "express";
import userRoutes from "./user.routes";
import albumRoutes from "./album.routes";

const serverRoutes = (app: Express) => {
  app.use("/api/v1/users", userRoutes);
  app.use("/api/v1/albums", albumRoutes);
};

export default serverRoutes;
