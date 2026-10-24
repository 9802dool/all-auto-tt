export type CheckoutInput = {
  dealerId: string;
  amountTtd: number;
  description: string;
  returnUrl: string;
};

/**
 * Card payments are a later provider. v1 records a bank transfer and a receipt.
 * WiPay can implement this same function without changing the billing screens.
 */
export async function createWipayCheckout(_input: CheckoutInput): Promise<{ enabled: false; message: string }> {
  return {
    enabled: false,
    message: "Card payments with WiPay are not switched on. Pay by bank transfer and upload the receipt.",
  };
}

export const paymentMethods = ["bank_transfer", "wipay"] as const;
