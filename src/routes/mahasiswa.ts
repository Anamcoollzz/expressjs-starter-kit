import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { index, show, store, update, destroy, signedDownload } from "../controllers/mahasiswaController.js";

const router = Router();

router.get("/", requireAuth, index);
router.post("/", requireAuth, store);
router.get("/:id", requireAuth, show);
router.put("/:id", requireAuth, update);
router.delete("/:id", requireAuth, destroy);
router.get("/:id/signed-download", signedDownload);

export default router;
