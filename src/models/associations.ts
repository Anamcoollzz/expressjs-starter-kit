import { sequelize } from "../config/database.js";
import { User } from "./User.js";
import { Role } from "./Role.js";
import { Permission } from "./Permission.js";
import { DataTypes } from "sequelize";

export const UserRole = sequelize.define('user_roles', {
  userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  roleId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false }
}, { timestamps: false });

export const RolePermission = sequelize.define('role_permissions', {
  roleId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  permissionId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false }
}, { timestamps: false });

User.belongsToMany(Role, { through: UserRole, foreignKey: 'userId' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'roleId' });

Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'roleId' });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permissionId' });
