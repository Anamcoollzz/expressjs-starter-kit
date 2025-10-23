import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database.js";

interface PermissionAttributes {
  id: number;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}
type PermissionCreationAttributes = Optional<PermissionAttributes, "id">;

export class Permission extends Model<PermissionAttributes, PermissionCreationAttributes> implements PermissionAttributes {
  public id!: number;
  public name!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}
Permission.init(
  { id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true } },
  { sequelize, modelName: "Permission", tableName: "permissions" }
);
