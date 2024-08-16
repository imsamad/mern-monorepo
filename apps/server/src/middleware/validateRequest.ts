import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";
import { CustomResponseError } from "@repo/utils";

export const validateRequest = (
  schema: ZodSchema,
  at: "body" | "query" | "params",
) => {
  return (req: Request, _: Response, next: NextFunction) => {
    let result = schema.safeParse(req[at]);
    if (result.success) next();
    else {
      const flattenErrors = result.error.flatten();
      const isEmpty = Object.keys(flattenErrors.fieldErrors).length == 0;
      throw new CustomResponseError(404, {
        errors: isEmpty ? flattenErrors.formErrors : flattenErrors.fieldErrors,
      });
    }
  };
};
