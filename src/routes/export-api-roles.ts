import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { Role } from "../models/Role.js";
import { exportData } from "../utils/exporter.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const format = (req.query.format as string || "csv") as any;
  const colsParam = (req.query.cols as string) || "";
  const cols = colsParam ? colsParam.split(",").map(s=>s.trim()).filter(Boolean) : undefined;

  const rows = await Role.findAll();
  const flat = rows.map(r => ({ id: r.id, name: r.name, createdAt: r.createdAt, updatedAt: r.updatedAt }));

  await exportData(res, format, "roles", flat, cols || ["id","name","createdAt","updatedAt"], "Roles Export");
});

export default router;
