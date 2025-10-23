import { Router } from "express";
import { showLogin, doLogin, logout } from "../controllers/adminAuthController.js";

const router = Router();
router.get("/login", showLogin);
router.post("/login", doLogin);
router.post("/logout", logout);

export default router;
