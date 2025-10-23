import { Request, Response, NextFunction } from "express";
import { Role } from "../models/Role.js";
import { Permission } from "../models/Permission.js";
import { User } from "../models/User.js";
import "../models/associations.js";

export function requirePermission(name: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const user = await User.findByPk(userId, { include: [{ model: Role, include: [Permission] }] });
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    // @ts-ignore
    const has = (user.Roles || []).some((r:any) => r.Permissions?.some((p:any) => p.name === name));
    if (!has) return res.status(403).json({ message: "Forbidden" });
    next();
  };
}
