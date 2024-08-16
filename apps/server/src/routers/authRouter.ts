import { Router } from "express";
import {
  confirmOTP,
  getMe,
  login,
  logout,
  resendOTP,
  signUp,
} from "../controllers/authCtrl";
import { authMiddleware } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import { LoginSchema, SignUpSchema } from "@repo/utils";

const authRouter: Router = Router();

authRouter.post("/signup", validateRequest(SignUpSchema, "body"), signUp);
authRouter.post("/login", validateRequest(LoginSchema, "body"), login);
authRouter.delete("/logout", logout);
authRouter.post("/confirmOTP/:token", confirmOTP);
authRouter.post("/resendOTP/:userId", resendOTP);

authRouter.post("/forgetPassword", () => {});
authRouter.post("/forgetIdentifier", () => {});
authRouter.get("/me", authMiddleware, getMe);

export { authRouter };
