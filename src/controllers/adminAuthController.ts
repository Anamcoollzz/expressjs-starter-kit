import { Request, Response } from "express";
import { User } from "../models/User.js";
import bcrypt from "bcryptjs";

export function showLogin(req: Request, res: Response) {
  // @ts-ignore
  if (req.session?.user) return res.redirect('/admin');
  res.render('admin/auth/login', { title: 'Admin Login', error: null });
}

export async function doLogin(req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.render('admin/auth/login', { title: 'Admin Login', error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.render('admin/auth/login', { title: 'Admin Login', error: 'Invalid credentials' });
  // @ts-ignore
  req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };
  res.redirect('/admin');
}

export function logout(req: Request, res: Response) {
  // @ts-ignore
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
}
