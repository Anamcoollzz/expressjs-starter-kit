import { Request, Response } from "express";
import { User } from "../models/User.js";
import { buildListParams } from "../utils/searchBuilder.js";
import { Role } from "../models/Role.js";
import bcrypt from "bcryptjs";
import "../models/associations.js";

export async function list(req: Request, res: Response) {
  const { limit, offset, where, order } = buildListParams(req.query as any, ["name","email","role","createdAt"]);
  const page = Number((req.query as any).page || 1);
  const { rows, count } = await User.findAndCountAll({ include: [Role], limit, offset, where: { ...(where as any), ...(req.query.role ? { role: req.query.role } : {}) }, order });
  res.render("admin/users/index", { title: "Users", items: rows, count, limit, page, query: req.query });
}

export async function create(req: Request, res: Response) {
  const roles = await Role.findAll();
  res.render("admin/users/create", { title: "Create User", roles, error: null });
}

export async function store(req: Request, res: Response) {
  const { name, email, password, roleId } = req.body;
  const dup = await User.findOne({ where: { email } });
  if (dup && String(dup.id) !== String(req.params.id)) {
    const roles = await Role.findAll();
    const userCur = await User.findByPk(req.params.id, { include: [Role] });
    if (!userCur) return res.redirect('/admin/users');
    // @ts-ignore
    return res.status(422).render('admin/users/edit', { title: 'Edit User', item: userCur, roles, error: 'Duplicate email' });
  }
  const existed = await User.findOne({ where: { email } });
  if (existed) return res.status(422).render('admin/users/create', { title: 'Create User', roles: await Role.findAll(), error: 'Email already used' });
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hash, role: "user" });
  if (roleId) {
    // @ts-ignore
    await user.addRole(roleId);
  }
  res.redirect("/admin/users");
}

export async function edit(req: Request, res: Response) {
  const user = await User.findByPk(req.params.id, { include: [Role] });
  const roles = await Role.findAll();
  res.render("admin/users/edit", { title: "Edit User", item: user, roles, error: null });
}

export async function update(req: Request, res: Response) {
  const { name, email, password, roleId } = req.body;
  const dup = await User.findOne({ where: { email } });
  if (dup && String(dup.id) !== String(req.params.id)) {
    const roles = await Role.findAll();
    const userCur = await User.findByPk(req.params.id, { include: [Role] });
    if (!userCur) return res.redirect('/admin/users');
    // @ts-ignore
    return res.status(422).render('admin/users/edit', { title: 'Edit User', item: userCur, roles, error: 'Duplicate email' });
  }
  const existed = await User.findOne({ where: { email } });
  if (existed) return res.status(422).render('admin/users/create', { title: 'Create User', roles: await Role.findAll(), error: 'Email already used' });
  const user = await User.findByPk(req.params.id);
  if (!user) return res.redirect("/admin/users");
  await user.update({ name, email, password: password ? await bcrypt.hash(password, 10) : user.password });
  // reset role
  // @ts-ignore
  await user.setRoles(roleId ? [roleId] : []);
  res.redirect("/admin/users");
}

export async function destroy(req: Request, res: Response) {
  const user = await User.findByPk(req.params.id);
  if (user) await user.destroy();
  res.redirect("/admin/users");
}
