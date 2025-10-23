import { Request, Response } from "express";
import { Payment } from "../models/Payment.js";
import { buildListParams } from "../utils/searchBuilder.js";

export async function list(req: Request, res: Response) {
  const { limit, offset, where, order, page } = Object.assign(
    buildListParams(req.query as any, ["orderId", "status", "paymentType"]),
    { page: Number((req.query as any).page || 1) }
  );
  const { Op } = await import('sequelize');
  const extra:any = { ...(req.query.status ? { status: req.query.status } : {}), ...(req.query.paymentType ? { paymentType: req.query.paymentType } : {}) };
  if (req.query.updatedAt_from || req.query.updatedAt_to) {
    extra.updatedAt = { [Op.between]: [ new Date(req.query.updatedAt_from as string || '1970-01-01'), new Date(req.query.updatedAt_to as string || '2999-12-31') ] };
  }
  const { rows, count } = await Payment.findAndCountAll({
    limit, offset, where: { ...(where as any), ...extra }, order: order.length ? order : [["updatedAt","DESC"]]
  });
  res.render("admin/payments/index", { title: "Payments", items: rows, count, limit, page, query: req.query });
}

export async function show(req: Request, res: Response) {
  const item = await Payment.findByPk(req.params.id);
  if (!item) return res.redirect("/admin/payments");
  res.render("admin/payments/show", { title: `Payment #${item.id}`, item });
}
