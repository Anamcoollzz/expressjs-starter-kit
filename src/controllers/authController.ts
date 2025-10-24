import { Request, Response } from 'express';
import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function register(req: Request, res: Response) {
  const { name, email, password } = req.body;
  const existed = await User.findOne({ where: { email } });
  if (existed) return res.status(422).json({ message: 'Email already used' });
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hash, role: 'user' });
  res.json({ id: user.id, name: user.name, email: user.email });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRES || '1d' },
  );
  res.json({ token });
}
