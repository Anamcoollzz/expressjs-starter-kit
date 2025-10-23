import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { Mahasiswa } from "../models/Mahasiswa.js";
import { buildListParams } from "../utils/searchBuilder.js";
import { exportData } from "../utils/exporter.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const format = (req.query.format as string || "csv") as any;
  const colsParam = (req.query.cols as string) || "";
  const cols = colsParam ? colsParam.split(",").map(s=>s.trim()).filter(Boolean) : undefined;

  const { where, order } = buildListParams(req.query as any, ["nama","nim","email"]);
  const rows = await Mahasiswa.findAll({ where, order });
  const flat = rows.map(r => r.toJSON());

  await exportData(res, format, "mahasiswa", flat, cols || ["id","nama","nim","email","foto","createdAt","updatedAt"], "Mahasiswa Export");
});

export default router;
