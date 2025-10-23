import { Router } from "express";
import { ensureAdminSession } from "../middleware/adminSession.js";
import { exportData } from "../utils/exporter.js";
import { Mahasiswa } from "../models/Mahasiswa.js";
import { User } from "../models/User.js";
import { Role } from "../models/Role.js";
import { Payment } from "../models/Payment.js";
import { buildListParams } from "../utils/searchBuilder.js";

const router = Router();
router.use(ensureAdminSession);

router.get("/mahasiswa", async (req, res) => {
  const format = (req.query.format as string || "csv") as any;
  const colsParam = (req.query.cols as string) || "";
  const cols = colsParam ? colsParam.split(",").map(s=>s.trim()).filter(Boolean) : undefined;
  const { where, order } = buildListParams(req.query as any, ["nama","nim","email"]);
  const rows = await Mahasiswa.findAll({ where, order });
  await exportData(res, format, "mahasiswa", rows.map(r => r.toJSON()), cols || ["id","nama","nim","email","foto","createdAt","updatedAt"], "Mahasiswa Export");
});

router.get("/users", async (req, res) => {
  const format = (req.query.format as string || "csv") as any;
  const colsParam = (req.query.cols as string) || "";
  const cols = colsParam ? colsParam.split(",").map(s=>s.trim()).filter(Boolean) : undefined;
  const rows = await User.findAll();
  await exportData(res, format, "users", rows.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt, updatedAt: u.updatedAt })), cols || ["id","name","email","role","createdAt","updatedAt"], "Users Export");
});

router.get("/roles", async (req, res) => {
  const format = (req.query.format as string || "csv") as any;
  const colsParam = (req.query.cols as string) || "";
  const cols = colsParam ? colsParam.split(",").map(s=>s.trim()).filter(Boolean) : undefined;
  const rows = await Role.findAll();
  await exportData(res, format, "roles", rows.map(r => ({ id: r.id, name: r.name, createdAt: r.createdAt, updatedAt: r.updatedAt })), cols || ["id","name","createdAt","updatedAt"], "Roles Export");
});

router.get("/payments", async (req, res) => {
  const format = (req.query.format as string || "csv") as any;
  const colsParam = (req.query.cols as string) || "";
  const cols = colsParam ? colsParam.split(",").map(s=>s.trim()).filter(Boolean) : undefined;
  const { where, order } = buildListParams(req.query as any, ["orderId","status","paymentType"]);
  const rows = await Payment.findAll({ where, order });
  await exportData(res, format, "payments", rows.map(p => p.toJSON()), cols || ["id","orderId","amount","status","paymentType","transactionId","fraudStatus","updatedAt"], "Payments Export");
});

export default router;
