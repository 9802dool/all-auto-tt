export const notices: Record<string, string> = {
  saved: "Saved.",
  sent: "Message sent. The dealer has it in their inbox.",
  requested: "Request posted. Dealers who stock this make were emailed.",
  review: "Thanks. One review is kept for each phone number, so this replaced an earlier one if you had written before.",
  report: "Report received. We'll look at the listing.",
  renewed: "Listing renewed for 60 days.",
  joined: "Account created. You can draft listings while approval is pending.",
  receipt: "Receipt uploaded. The plan or boost goes live after the transfer is checked.",
  featured: "Feature request saved. Upload the bank receipt so it can be switched on.",
  upgrade: "Upgrade request saved. Upload the receipt for the transfer.",
  extra: "Order sent to ALL AUTO TT. Upload the receipt, then we schedule the work.",
  imported: "Import finished.",
  status: "Listing updated.",
  signedout: "Signed out.",
};

export function notice(code: string | undefined) {
  if (!code) return "";
  return notices[code] ?? "";
}
