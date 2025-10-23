import { Request, Response } from "express";
import { Role } from "../models/Role.js";
import { Permission } from "../models/Permission.js";
import { buildListParams } from "../utils/searchBuilder.js";
import "../models/associations.js";

export async function list(req: Request, res: Response) {
  const { limit, offset, where, order } = buildListParams(req.query as any, ["name","createdAt"]);
  const page = Number((req.query as any).page || 1);
  const { rows, count } = await Role.findAndCountAll({ include: [Permission], limit, offset, where, order });
  res.render("admin/roles/index", { title: "Roles", items: rows, count, limit, page, query: req.query });
}

export async function create(req: Request, res: Response) {
  const perms = await Permission.findAll();
  res.render("admin/roles/create", { title: "Create Role", perms });
}

export async function store(req: Request, res: Response) {
  const { name, permissions } = req.body;
  const role = await Role.create({ name });
  // @ts-ignore
  await role.setPermissions(Array.isArray(permissions) ? permissions : permissions ? [permissions] : []);
  res.redirect("/admin/roles");
}

export async function edit(req: Request, res: Response) {
  const role = await Role.findByPk(req.params.id, { include: [Permission] });
  const perms = await Permission.findAll();
  res.render("admin/roles/edit", { title: "Edit Role", item: role, perms });
}

export async function update(req: Request, res: Response) {
  const { name, permissions } = req.body;
  const role = await Role.findByPk(req.params.id);
  if (!role) return res.redirect("/admin/roles");
  await role.update({ name });
  // @ts-ignore
  await role.setPermissions(Array.isArray(permissions) ? permissions : permissions ? [permissions] : []);
  res.redirect("/admin/roles");
}

export async function destroy(req: Request, res: Response) {
  const role = await Role.findByPk(req.params.id);
  if (role) await role.destroy();
  res.redirect("/admin/roles");
}
