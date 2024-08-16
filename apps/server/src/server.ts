require("dotenv").config({
  path: `${process.cwd()}/.env`,
});

import express, { type Express } from "express";
import morgan from "morgan";
import cors from "cors";
import { authRouter } from "./routers/authRouter";
import cookieParser from "cookie-parser";
import { CustomResponseError } from "@repo/utils";
import { errorHandlerMiddleware } from "./middleware/errorHandlerMiddleware";

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
    }),
  );

app.use("/api/v1/auth", authRouter);
app.get(["/status", "/"], async (req, res) => {
  res.json({ ok: true });
});

app.use(() => {
  throw new CustomResponseError(400, "not found");
});

app.use(errorHandlerMiddleware);

export { app as server };
