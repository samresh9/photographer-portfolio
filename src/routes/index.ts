import { Express } from "express";
import userRoutes from "./user.routes";
import albumRoutes from "./album.routes";
import fileServeRoutes from "./file.routes";

const serverRoutes = (app: Express) => {
  app.use("/api/v1/users", userRoutes);
  app.use("/api/v1/albums", albumRoutes);
  app.use("/api/v1/access-file", fileServeRoutes);
};

export default serverRoutes;
