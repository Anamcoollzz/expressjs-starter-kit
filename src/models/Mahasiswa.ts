import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database.js";

interface MahasiswaAttributes {
  id: number;
  nama: string;
  nim: string;
  email: string;
  foto?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type MahasiswaCreationAttributes = Optional<MahasiswaAttributes, "id" | "foto">;

export class Mahasiswa extends Model<MahasiswaAttributes, MahasiswaCreationAttributes> implements MahasiswaAttributes {
  public id!: number;
  public nama!: string;
  public nim!: string;
  public email!: string;
  public foto!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Mahasiswa.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    nama: { type: DataTypes.STRING, allowNull: false },
    nim: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    foto: { type: DataTypes.STRING, allowNull: true }
  },
  { sequelize, modelName: "Mahasiswa", tableName: "mahasiswas" }
);
