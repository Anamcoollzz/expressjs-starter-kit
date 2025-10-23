import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { exportData } from "../utils/exporter.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const format = (req.query.format as string || "csv") as any;
  const colsParam = (req.query.cols as string) || "";
  const cols = colsParam ? colsParam.split(",").map(s=>s.trim()).filter(Boolean) : undefined;

  const rows = await User.findAll();
  const flat = rows.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt, updatedAt: u.updatedAt }));

  await exportData(res, format, "users", flat, cols || ["id","name","email","role","createdAt","updatedAt"], "Users Export");
});

export default router;
