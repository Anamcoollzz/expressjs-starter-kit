import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { Payment } from "../models/Payment.js";
import { buildListParams } from "../utils/searchBuilder.js";
import { exportData } from "../utils/exporter.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const format = (req.query.format as string || "csv") as any;
  const colsParam = (req.query.cols as string) || "";
  const cols = colsParam ? colsParam.split(",").map(s=>s.trim()).filter(Boolean) : undefined;

  const { where, order } = buildListParams(req.query as any, ["orderId","status","paymentType"]);
  const rows = await Payment.findAll({ where, order });
  const flat = rows.map(p => p.toJSON());

  await exportData(res, format, "payments", flat, cols || ["id","orderId","amount","status","paymentType","transactionId","fraudStatus","updatedAt"], "Payments Export");
});

export default router;
