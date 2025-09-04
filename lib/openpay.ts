import { nanoid } from "nanoid";

// Simulated Openpay integration for demo purposes
export class OpenpayService {
  private merchantId: string;
  private privateKey: string;
  private publicKey: string;
  private sandbox: boolean;

  constructor() {
    this.merchantId = process.env.OPENPAY_MERCHANT_ID || "demo_merchant";
    this.privateKey = process.env.OPENPAY_PRIVATE_KEY || "demo_private_key";
    this.publicKey =
      process.env.NEXT_PUBLIC_OPENPAY_PUBLIC_KEY || "demo_public_key";
    this.sandbox = process.env.OPENPAY_SANDBOX === "true";
  }

  async createCharge(data: {
    amount: number;
    description: string;
    customer: {
      name: string;
      email: string;
    };
    orderId: string;
  }) {
    // In a real implementation, this would make actual API calls to Openpay
    // For demo purposes, we'll simulate the response

    const chargeId = nanoid();
    const paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment/checkout/${chargeId}`;

    // Simulate payment processing
    return {
      id: chargeId,
      amount: data.amount,
      description: data.description,
      status: "charge_pending",
      payment_method: {
        type: "redirect",
        url: paymentUrl,
      },
      creation_date: new Date().toISOString(),
      operation_date: new Date().toISOString(),
      transaction_type: "charge",
      order_id: data.orderId,
    };
  }

  async getCharge(chargeId: string) {
    // Simulate charge status check
    return {
      id: chargeId,
      status: "completed", // For demo, always return completed
      amount: 100.0,
      creation_date: new Date().toISOString(),
      operation_date: new Date().toISOString(),
    };
  }
}

export const openpay = new OpenpayService();
