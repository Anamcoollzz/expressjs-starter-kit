import { Request, Response } from 'express';
import midtransClient from 'midtrans-client';
import crypto from 'crypto';
import { Payment } from '../models/Payment.js';

function core() {
  return new midtransClient.CoreApi({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY as string,
    clientKey: process.env.MIDTRANS_CLIENT_KEY as string,
  });
}

export async function charge(req: Request, res: Response) {
  const orderId = req.body.order_id || `ORD-${Date.now()}`;
  const amount = Number(req.body.gross_amount || 10000);
  const payment_type = req.body.payment_type || 'bank_transfer';

  const params: any = {
    payment_type,
    transaction_details: { order_id: orderId, gross_amount: amount },
    customer_details: {
      first_name: req.body.first_name || 'Guest',
      email: req.body.email || 'guest@example.com',
    },
  };

  if (payment_type === 'bank_transfer') {
    params.bank_transfer = { bank: req.body.bank || 'bca' };
  } else if (payment_type === 'echannel') {
    params.echannel = { bill_info1: 'Payment', bill_info2: 'Online' };
  } else if (payment_type === 'gopay') {
    params.gopay = {
      enable_callback: true,
      callback_url: req.body.callback_url || 'https://example.com',
    };
  } else if (payment_type === 'qris') {
    params.qris = {};
  }

  try {
    const api = core();
    const result: any = await api.charge(params);

    const rec = await Payment.create({
      orderId,
      amount,
      status: result.transaction_status || null,
      paymentType: result.payment_type || payment_type,
      transactionId: result.transaction_id || null,
      fraudStatus: result.fraud_status || null,
      rawRequest: params,
      rawResponse: result,
      vaNumbers: result.va_numbers || null,
    });

    res.json({ order_id: orderId, result, record_id: rec.id });
  } catch (e: any) {
    res.status(400).json({ message: e.message || 'Midtrans charge error' });
  }
}

export async function status(req: Request, res: Response) {
  const { orderId } = req.params;
  try {
    const api = core();
    // @ts-ignore
    const result: any = await api.transaction.status(orderId);
    await Payment.update(
      {
        status: result.transaction_status || null,
        paymentType: result.payment_type || null,
        transactionId: result.transaction_id || null,
        fraudStatus: result.fraud_status || null,
        rawResponse: result,
      },
      { where: { orderId } },
    );
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message || 'Midtrans status error' });
  }
}

export async function notification(req: Request, res: Response) {
  const body: any = req.body;

  // Optional: verify signature_key if present
  try {
    if (body.signature_key) {
      const raw =
        body.order_id +
        body.status_code +
        body.gross_amount +
        (process.env.MIDTRANS_SERVER_KEY as string);
      const expected = crypto.createHash('sha512').update(raw).digest('hex');
      if (expected !== body.signature_key) {
        return res.status(403).json({ message: 'Invalid signature' });
      }
    }
    await Payment.update(
      {
        status: body.transaction_status || null,
        paymentType: body.payment_type || null,
        transactionId: body.transaction_id || null,
        fraudStatus: body.fraud_status || null,
        rawResponse: body,
        signatureKey: body.signature_key || null,
        settlementTime: body.settlement_time
          ? new Date(body.settlement_time)
          : null,
      },
      { where: { orderId: body.order_id } },
    );

    res.json({ received: true });
  } catch (e: any) {
    res.status(400).json({ message: e.message || 'Notification error' });
  }
}
