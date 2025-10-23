import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database.js";

interface PaymentAttributes {
  id: number;
  orderId: string;
  userId?: number | null;
  amount: number;
  status: string | null;
  paymentType: string | null;
  transactionId: string | null;
  fraudStatus: string | null;
  snapToken: string | null;
  redirectUrl: string | null;
  rawRequest?: object | null;
  rawResponse?: object | null;
  vaNumbers?: object | null;
  signatureKey?: string | null;
  settlementTime?: Date | null;
  refundTime?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type PaymentCreationAttributes = Optional<PaymentAttributes, "id" | "userId" | "status" | "paymentType" | "transactionId" | "fraudStatus" | "snapToken" | "redirectUrl" | "rawRequest" | "rawResponse" | "vaNumbers" | "signatureKey" | "settlementTime" | "refundTime">;

export class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
  public id!: number;
  public orderId!: string;
  public userId!: number | null;
  public amount!: number;
  public status!: string | null;
  public paymentType!: string | null;
  public transactionId!: string | null;
  public fraudStatus!: string | null;
  public snapToken!: string | null;
  public redirectUrl!: string | null;
  public rawRequest!: object | null;
  public rawResponse!: object | null;
  public vaNumbers!: object | null;
  public signatureKey!: string | null;
  public settlementTime!: Date | null;
  public refundTime!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Payment.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    orderId: { type: DataTypes.STRING, allowNull: false, unique: true },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    amount: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: true },
    paymentType: { type: DataTypes.STRING, allowNull: true },
    transactionId: { type: DataTypes.STRING, allowNull: true },
    fraudStatus: { type: DataTypes.STRING, allowNull: true },
    snapToken: { type: DataTypes.STRING, allowNull: true },
    redirectUrl: { type: DataTypes.STRING, allowNull: true },
    rawRequest: { type: DataTypes.JSON, allowNull: true },
    rawResponse: { type: DataTypes.JSON, allowNull: true },
    vaNumbers: { type: DataTypes.JSON, allowNull: true },
    signatureKey: { type: DataTypes.STRING, allowNull: true },
    settlementTime: { type: DataTypes.DATE, allowNull: true },
    refundTime: { type: DataTypes.DATE, allowNull: true }
  },
  { sequelize, modelName: "Payment", tableName: "payments" }
);
