import { Express } from "express";
import morgan from "morgan";

const isDev = process.env.NODE_ENV === "development";

export default (app: Express) => {
  app.use(morgan(isDev ? "tiny" : "combined"));
};
