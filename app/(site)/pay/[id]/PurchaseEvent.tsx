"use client";

import { useEffect } from "react";
import { EVENTS, pushEvent } from "@/app/lib/gtm";

type PurchaseEventProps = {
  transactionId: string;
  value: number;
  currency: string;
};

/**
 * Fires only when rendered by the confirmed-payment state on the server.
 * Meta/GTM can deduplicate repeat page loads using the stable transaction ID.
 */
export default function PurchaseEvent({
  transactionId,
  value,
  currency,
}: PurchaseEventProps) {
  useEffect(() => {
    const storageKey = `cm_purchase_${transactionId}`;
    try {
      if (window.localStorage.getItem(storageKey)) return;
      // Set the guard before pushing so a navigation during tag processing
      // cannot emit the same purchase again from this browser.
      window.localStorage.setItem(storageKey, "1");
    } catch {
      // Storage can be blocked. Preserve the confirmation page and fire once
      // for this view rather than turning analytics into a customer error.
    }
    pushEvent(EVENTS.PURCHASE, {
      event_id: transactionId,
      ecommerce: {
        value,
        currency: currency.toUpperCase(),
        transaction_id: transactionId,
      },
    });
  }, [currency, transactionId, value]);

  return null;
}
