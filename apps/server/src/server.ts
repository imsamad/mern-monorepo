require("dotenv").config({
  path: `${process.cwd()}/.env`,
});

import express, { type Express } from "express";
import morgan from "morgan";
import cors from "cors";
import fileUpload from "express-fileupload";
import path from "path";

import cookieParser from "cookie-parser";
import { CustomResponseError } from "@repo/utils";

import { errorHandlerMiddleware } from "./middleware/errorHandlerMiddleware";
import { assetRouter } from "./routers/assetRouter";
import { authRouter } from "./routers/authRouter";

const app: Express = express();

app
  .disable("x-powered-by")
  .use(morgan("dev"))
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  .use(cookieParser())
  .use(
    cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
    })
  )
  .use(
    fileUpload({
      useTempFiles: true,
      tempFileDir: path.join(process.cwd(), "__tmp__"),
      createParentPath: true,
      safeFileNames: true,
      uriDecodeFileNames: true,
      uploadTimeout: 60_000,
      preserveExtension: true,
    })
  );

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/assets", assetRouter);

app.post(["/status", "/"], async (req, res) => {
  res.send("running");
});

app.use(() => {
  throw new CustomResponseError(400, "not found");
});

app.use(errorHandlerMiddleware);

export { app as server };
