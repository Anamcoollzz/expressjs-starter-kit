import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { charge, status, notification } from "../controllers/paymentCoreController.js";

const router = Router();

router.post("/charge", requireAuth, charge);
router.get("/status/:orderId", requireAuth, status);

// Midtrans callback (no auth); set the URL in Midtrans dashboard
router.post("/notification", notification);

export default router;
