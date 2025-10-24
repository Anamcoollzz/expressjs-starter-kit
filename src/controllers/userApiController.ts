import { Request, Response } from 'express';
import { User } from '../models/User.js';
import { buildListParams } from '../utils/searchBuilder.js';
import { verifySignedQuery } from '../utils/signedUrl.js';
import { Role } from '../models/Role.js';
import bcrypt from 'bcryptjs';

export async function index(req: Request, res: Response) {
  const { limit, offset, where, order } = buildListParams(req.query as any, [
    'nama',
    'nim',
    'email',
  ]);
  const { rows, count } = await User.findAndCountAll({
    limit,
    offset,
    where,
    order,
  });
  res.json({ data: rows, meta: { total: count, limit, offset } });
}

export async function show(req: Request, res: Response) {
  const item = await User.findByPk(req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json(item);
}

export async function store(req: Request, res: Response) {
  const { name, email, password, roleId } = req.body;
  const dup = await User.findOne({ where: { email } });
  if (dup && String(dup.id) !== String(req.params.id)) {
    const userCur = await User.findByPk(req.params.id, { include: [Role] });
    if (!userCur) return res.json({ message: 'Not found' }).status(404);
    return res.status(422).json({
      error: 'Duplicate email',
    });
  }
  const existed = await User.findOne({ where: { email } });
  if (existed)
    return res.status(422).json({
      error: 'Email already used',
    });
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hash, role: 'user' });
  if (roleId) {
    // @ts-ignore
    await user.addRole(roleId);
  }
  res.status(201).json({
    data: user,
  });
}

export async function update(req: Request, res: Response) {
  const { name, email, password, roleId } = req.body;
  const dup = await User.findOne({ where: { email } });
  if (dup && String(dup.id) !== String(req.params.id)) {
    const userCur = await User.findByPk(req.params.id, { include: [Role] });
    if (!userCur) return res.json({ message: 'Not found' }).status(404);
    // @ts-ignore
    return res.status(422).json({
      error: 'Duplicate email',
    });
  }
  const existed = await User.findOne({ where: { email } });
  if (existed)
    return res.status(422).json({
      error: 'Email already used',
    });
  const user = await User.findByPk(req.params.id);
  if (!user) return res.json({ message: 'Not found' }).status(404);
  await user.update({
    name,
    email,
    password: password ? await bcrypt.hash(password, 10) : user.password,
  });
  // reset role
  // @ts-ignore
  await user.setRoles(roleId ? [roleId] : []);
  res.json(user);
}

export async function destroy(req: Request, res: Response) {
  const item = await User.findByPk(req.params.id);
  console.log('Deleting user', item);
  if (!item) return res.status(404).json({ message: 'Not found' });
  await item.destroy();
  res.json({ message: 'Deleted' });
}

export async function signedDownload(req: Request, res: Response) {
  const { sig, exp } = req.query as any;
  const path = req.path.replace(/\/signed-download$/, '');
  if (!sig || !exp || !verifySignedQuery(path, String(sig), String(exp))) {
    return res.status(403).json({ message: 'Invalid or expired link' });
  }
  // Demo: return JSON; replace with real file streaming
  const item = await User.findByPk(req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'OK to download', User: item });
}
