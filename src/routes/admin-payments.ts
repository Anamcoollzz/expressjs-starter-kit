import { Router } from "express";
import * as ctrl from "../controllers/adminPaymentController.js";

const router = Router();
router.get("/", ctrl.list);
router.get("/:id", ctrl.show);

export default router;
