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
    pushEvent(EVENTS.PURCHASE, {
      ecommerce: {
        value,
        currency: currency.toUpperCase(),
        transaction_id: transactionId,
      },
    });
  }, [currency, transactionId, value]);

  return null;
}
