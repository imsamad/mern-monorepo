import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { uploadAsset } from "../controllers/assetCtrl";

const assetRouter: Router = Router();

assetRouter.post("/", authMiddleware, uploadAsset);

export { assetRouter };
