import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const dialect = (process.env.DB_DIALECT || "mysql") as any;

export const sequelize = new Sequelize(
  process.env.DB_DATABASE || "mahasiswa_db",
  process.env.DB_USERNAME || "root",
  (process.env.DB_PASSWORD as string) || "",
  {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    dialect,
    logging: false
  }
);
