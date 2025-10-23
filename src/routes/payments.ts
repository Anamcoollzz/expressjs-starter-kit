import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { createSnapToken } from "../controllers/paymentController.js";

const router = Router();
router.post("/snap/token", requireAuth, createSnapToken);

export default router;
