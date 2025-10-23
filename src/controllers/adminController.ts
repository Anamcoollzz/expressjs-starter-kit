import { Request, Response } from "express";
import { Mahasiswa } from "../models/Mahasiswa.js";
import { buildListParams } from "../utils/searchBuilder.js";

export async function dashboard(req: Request, res: Response) {
  const total = await Mahasiswa.count();
  res.render("admin/dashboard", { title: "Dashboard", total });
}

export async function mahasiswaIndex(req: Request, res: Response) {
  const { limit, offset, where, order, page } = Object.assign(buildListParams(req.query as any, ["nama", "nim", "email"]), { page: req.query.page || 1 });
  const { rows, count } = await Mahasiswa.findAndCountAll({ limit, offset, where, order });
  res.render("admin/mahasiswa/index", { title: "Mahasiswa", items: rows, count, limit, page: Number(page), query: req.query });
}

export async function mahasiswaCreate(req: Request, res: Response) {
  res.render("admin/mahasiswa/create", { title: "Create Mahasiswa" });
}

export async function mahasiswaStore(req: Request, res: Response) {
  const { nama, nim, email, foto } = req.body;
  await Mahasiswa.create({ nama, nim, email, foto });
  res.redirect("/admin/mahasiswa");
}

export async function mahasiswaEdit(req: Request, res: Response) {
  const item = await Mahasiswa.findByPk(req.params.id);
  if (!item) return res.redirect("/admin/mahasiswa");
  res.render("admin/mahasiswa/edit", { title: "Edit Mahasiswa", item });
}

export async function mahasiswaUpdate(req: Request, res: Response) {
  const item = await Mahasiswa.findByPk(req.params.id);
  if (!item) return res.redirect("/admin/mahasiswa");
  const { nama, nim, email, foto } = req.body;
  await item.update({ nama, nim, email, foto });
  res.redirect("/admin/mahasiswa");
}

export async function mahasiswaDelete(req: Request, res: Response) {
  const item = await Mahasiswa.findByPk(req.params.id);
  if (item) await item.destroy();
  res.redirect("/admin/mahasiswa");
}
