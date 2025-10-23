import { Request, Response } from "express";
import midtransClient from "midtrans-client";

export async function createSnapToken(req: Request, res: Response) {
  const snap = new midtransClient.Snap({
    isProduction: (process.env.MIDTRANS_IS_PRODUCTION === "true"),
    serverKey: process.env.MIDTRANS_SERVER_KEY as string,
    clientKey: process.env.MIDTRANS_CLIENT_KEY as string
  });

  const orderId = `ORD-${Date.now()}`;
  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: Number(req.body.amount || 10000)
    },
    customer_details: {
      first_name: req.body.name || "Guest",
      email: req.body.email || "guest@example.com"
    }
  };
  try {
    const transaction = await snap.createTransaction(parameter);
    res.json({ token: transaction.token, redirect_url: transaction.redirect_url, order_id: orderId });
  } catch (e:any) {
    res.status(400).json({ message: e.message || "Midtrans error" });
  }
}
