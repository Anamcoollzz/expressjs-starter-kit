import { Request, Response } from "express";
import { Mahasiswa } from "../models/Mahasiswa.js";
import { buildListParams } from "../utils/searchBuilder.js";
import { verifySignedQuery } from "../utils/signedUrl.js";

export async function index(req: Request, res: Response) {
  const { limit, offset, where, order } = buildListParams(req.query as any, ["nama", "nim", "email"]);
  const { rows, count } = await Mahasiswa.findAndCountAll({ limit, offset, where, order });
  res.json({ data: rows, meta: { total: count, limit, offset } });
}

export async function show(req: Request, res: Response) {
  const item = await Mahasiswa.findByPk(req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });
  res.json(item);
}

export async function store(req: Request, res: Response) {
  const { nama, nim, email, foto } = req.body;
  const existed = await Mahasiswa.findOne({ where: { nim } });
  if (existed) return res.status(422).json({ message: "NIM already used" });
  const item = await Mahasiswa.create({ nama, nim, email, foto });
  res.status(201).json(item);
}

export async function update(req: Request, res: Response) {
  const item = await Mahasiswa.findByPk(req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });
  const { nama, nim, email, foto } = req.body;
  await item.update({ nama, nim, email, foto });
  res.json(item);
}

export async function destroy(req: Request, res: Response) {
  const item = await Mahasiswa.findByPk(req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });
  await item.destroy();
  res.json({ message: "Deleted" });
}

export async function signedDownload(req: Request, res: Response) {
  const { sig, exp } = req.query as any;
  const path = req.path.replace(/\/signed-download$/, "");
  if (!sig || !exp || !verifySignedQuery(path, String(sig), String(exp))) {
    return res.status(403).json({ message: "Invalid or expired link" });
  }
  // Demo: return JSON; replace with real file streaming
  const item = await Mahasiswa.findByPk(req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });
  res.json({ message: "OK to download", mahasiswa: item });
}
