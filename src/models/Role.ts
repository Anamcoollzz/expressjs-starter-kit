import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database.js";

interface RoleAttributes {
  id: number;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}
type RoleCreationAttributes = Optional<RoleAttributes, "id">;

export class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  public id!: number;
  public name!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}
Role.init(
  { id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true } },
  { sequelize, modelName: "Role", tableName: "roles" }
);
