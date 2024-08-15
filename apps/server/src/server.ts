import express, { type Express } from "express";
import morgan from "morgan";
import cors from "cors";

const app: Express = express();

app
  .disable("x-powered-by")
  .use(morgan("dev"))
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  .use(cors());

app.get(["/status", "/"], async (req, res) => {
  res.json({ ok: true });
});

export { app as server };
