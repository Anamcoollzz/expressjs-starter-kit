import { Request, Response, NextFunction } from "express";

export function ensureAdminSession(req: Request, res: Response, next: NextFunction) {
  // @ts-ignore
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  return res.redirect('/admin/login');
}
