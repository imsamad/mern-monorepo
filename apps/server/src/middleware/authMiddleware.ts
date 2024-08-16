import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { CustomResponseError } from "@repo/utils";
import { prismaClient } from "@repo/db";
import { AUTH_COOKIE_NAME } from "../lib/const";

export const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  let authToken = req.cookies[AUTH_COOKIE_NAME];

  authToken = authToken ? authToken : req.headers.authorization?.split(" ")[1];

  if (!authToken)
    throw new CustomResponseError(404, {
      message: "not authorised!",
    });

  const userJWT: any = jwt.verify(authToken, process.env.JWT_SECRET!);

  const user = await prismaClient.user.findUnique({
    where: { id: userJWT.id, isBlocked: false },
  });

  if (!user)
    throw new CustomResponseError(404, {
      message: "not authorised!",
    });

  user.password = "";

  req.user = user;

  next();
};

export const attachUserToRequest = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  let authToken = req.cookies[AUTH_COOKIE_NAME];

  authToken = authToken ? authToken : req.headers.authorization?.split(" ")[1];

  if (!authToken) return next();

  const userJWT: any = jwt.verify(authToken, process.env.JWT_SECRET!);

  const user = await prismaClient.user.findUnique({
    where: { id: userJWT.id, isBlocked: false },
  });

  if (!user) return next();

  user.password = "";

  req.user = user;

  next();
};
