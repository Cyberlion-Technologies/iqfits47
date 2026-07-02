/**
 * Lipia Online payment integration
 * ---------------------------------
 * Docs: https://lipia-online-docs.vercel.app/
 *
 * This file is the ONLY place that talks to the Lipia Online API.
 * Everything else in the app calls the functions below, so once Brian
 * drops in the real API key (and we double check exact field names
 * against the dashboard's "Security" tab / docs), only this file
 * should need edits.
 *
 * Required env vars (see .env.example):
 *   LIPIA_API_KEY   — generated from the Lipia Online app's Security tab
 *   LIPIA_BASE_URL  — defaults to https://lipia-online.vercel.app
 */

const LIPIA_BASE_URL = process.env.LIPIA_BASE_URL ?? "https://lipia-api.kreativelabske.com/api/v2";
const LIPIA_API_KEY = process.env.LIPIA_API_KEY ?? "";

export interface StkPushParams {
  phone: string; // normalized 2547XXXXXXXX / 2541XXXXXXXX
  amount: number;
  accountReference: string; // we pass the IQFIT47 order number here
  transactionDesc?: string;
}

export interface StkPushResult {
  success: boolean;
  reference?: string; // used to poll transaction status
  message: string;
  raw?: unknown;
}

export interface TransactionStatusResult {
  success: boolean;
  status: "pending" | "success" | "failed" | "cancelled" | "unknown";
  mpesaReceipt?: string;
  message: string;
  raw?: unknown;
}

function assertConfigured() {
  if (!LIPIA_API_KEY) {
    throw new Error(
      "LIPIA_API_KEY is not set. Add it to .env.local — see .env.example."
    );
  }
}

/**
 * Triggers an STK push prompt on the customer's phone.
 */
export async function initiateStkPush(
  params: StkPushParams
): Promise<StkPushResult> {
  assertConfigured();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://iqfits47.top";
  const callbackUrl = `${siteUrl}/api/payments/callback`;

  const res = await fetch(`${LIPIA_BASE_URL}/payments/stk-push`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LIPIA_API_KEY}`,
    },
    body: JSON.stringify({
      phone_number: params.phone,
      amount: params.amount,
      external_reference: params.accountReference,
      callback_url: callbackUrl,
      metadata: {
        transaction_desc: params.transactionDesc ?? "IQFIT47 order",
      }
    }),
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return {
      success: false,
      message:
        (data && (data.message || data.error)) ||
        `Lipia Online request failed (${res.status})`,
      raw: data,
    };
  }

  const success = data.success ?? (data.status === "success" || data.status === true);
  const transactionRef = data.data?.TransactionReference ?? data.reference ?? data.CheckoutRequestID ?? data.id;

  return {
    success: !!success,
    reference: transactionRef,
    message: data.customerMessage ?? data.message ?? "STK push sent. Enter your M-Pesa PIN to complete payment.",
    raw: data,
  };
}

/**
 * Polls the status of a previously initiated STK push.
 */
export async function checkTransactionStatus(
  reference: string
): Promise<TransactionStatusResult> {
  assertConfigured();

  const res = await fetch(
    `${LIPIA_BASE_URL}/payments/status?reference=${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${LIPIA_API_KEY}` },
      cache: "no-store",
    }
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return { success: false, status: "unknown", message: "Could not reach Lipia Online.", raw: data };
  }

  const rawStatus = String(data.data?.response?.Status ?? data.status ?? "").toLowerCase();
  let status: TransactionStatusResult["status"] = "unknown";
  
  if (["success", "completed", "paid"].includes(rawStatus)) {
    status = "success";
  } else if (["pending", "processing"].includes(rawStatus)) {
    status = "pending";
  } else if (["failed", "error"].includes(rawStatus)) {
    status = "failed";
  } else if (["cancelled", "canceled"].includes(rawStatus)) {
    status = "cancelled";
  }

  const success = data.success ?? (status === "success" || data.status === "success" || data.status === true);

  return {
    success: !!success,
    status,
    mpesaReceipt: data.data?.response?.MpesaReceiptNumber ?? data.mpesa_receipt ?? data.MpesaReceiptNumber,
    message: data.customerMessage ?? data.message ?? status,
    raw: data,
  };
}
