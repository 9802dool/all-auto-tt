export type LeadAlert = {
  dealerId: string;
  partId: string;
  type: "whatsapp" | "call" | "form";
  at: string;
};

/** SMS or WhatsApp Business alerts. v1 only stores the lead. */
export async function queueLeadAlert(_alert: LeadAlert): Promise<{ delivered: false; reason: string }> {
  return {
    delivered: false,
    reason: "Lead alerts are not connected yet. The lead is stored on the dealer dashboard.",
  };
}

export type DeliveryQuoteRequest = {
  partId: string;
  region: string;
};

/** Delivery partners are not booked in v1. Buyers collect and pay at the yard. */
export async function requestDeliveryQuote(_input: DeliveryQuoteRequest): Promise<{ available: false }> {
  return { available: false };
}
