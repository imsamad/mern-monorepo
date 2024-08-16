import { NextFunction, Request, Response } from "express";

import { TCustomError, TCustomResponseError } from "@repo/utils";

import { Prisma } from "@repo/db";

export const errorHandlerMiddleware = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.log("error from errorHandlerMiddleware =======================: ");
  console.log(err);

  if (err instanceof TCustomResponseError) {
    return res.status(err.statusCode).json(err.errors);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const _err: any = err;
    console.log(err.code);
    switch (_err.code) {
      case "P2002":
        // handling duplicate key errors
        return res.status(400).json({
          message: `Duplicate field value: ${_err.meta.target}`,
        });

      case "P2014":
        // handling invalid id errors
        return res.status(400).json({
          message: `Invalid ID: ${_err.meta.target}`,
        });
      case "P2003":
        // handling invalid data errors
        return res.status(400).json({
          message: `Invalid input data: ${_err.meta.target}`,
        });
      case "P2025":
        return res.status(400).json({
          message: `Record not found`,
        });
      case "P2023":
        return res.status(400).json({
          message: `provide valid data`,
        });
      default:
        // handling all other errors
        return res.status(500).json({
          message: `Something went wrong: ${_err.message}`,
        });
    }
  }

  if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    return res.status(404).json(err.message);
  }
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(404).json({
      message: "provide data in valid format",
    });
  }

  if (err instanceof TCustomError) {
    return res.status(404).json(err.errors);
  }

  res.status(500).json({
    errror: "server under maintenance!",
  });
};
