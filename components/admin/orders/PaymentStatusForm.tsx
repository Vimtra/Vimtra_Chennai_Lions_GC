"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { PaymentStatus } from "@prisma/client";
import { paymentStatusLabel } from "@/lib/orders-format";
import { updatePaymentStatusAction } from "@/app/admin/orders/actions";
import { adminToast } from "@/store/admin-toast";

const ALL: PaymentStatus[] = ["UNPAID", "PENDING", "PAID", "FAILED", "REFUNDED"];

/** Payment status + reference. Submits through the action and reports via toast. */
export default function PaymentStatusForm({
  orderId,
  current,
  paymentRef,
}: {
  orderId: string;
  current: PaymentStatus;
  paymentRef: string | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [value, setValue] = useState<PaymentStatus>(current);
  const [ref, setRef] = useState(paymentRef ?? "");
  const [error, setError] = useState<string | null>(null);

  const dirty = value !== current || (ref.trim() || "") !== (paymentRef ?? "");

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending || !dirty) return;
    setError(null);
    const fd = new FormData();
    fd.set("id", orderId);
    fd.set("paymentStatus", value);
    fd.set("paymentRef", ref.trim());
    start(async () => {
      try {
        const r = await updatePaymentStatusAction(fd);
        if (r.ok) {
          adminToast(r.message ?? "Payment updated.", "ok");
          router.refresh();
        } else {
          setError(r.error);
        }
      } catch {
        setError("Could not reach the server. Please try again.");
      }
    });
  };

  return (
    <form onSubmit={submit} className="adm-form" style={{ gap: 12 }}>
      <div className="adm-row adm-row-2">
        <div className="adm-field">
          <label className="adm-label" htmlFor="pay-status">
            Payment status
          </label>
          <select id="pay-status" value={value} onChange={(e) => setValue(e.target.value as PaymentStatus)} disabled={pending}>
            {ALL.map((s) => (
              <option key={s} value={s}>
                {paymentStatusLabel(s)}
              </option>
            ))}
          </select>
        </div>
        <div className="adm-field">
          <label className="adm-label" htmlFor="pay-ref">
            Payment reference <span className="adm-opt">optional</span>
          </label>
          <input
            id="pay-ref"
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            placeholder="Bank UTR / transaction id"
            disabled={pending}
            maxLength={120}
          />
        </div>
      </div>
      {error && (
        <div className="adm-alert" data-tone="danger" role="alert">
          <span>{error}</span>
        </div>
      )}
      <div className="adm-form-actions">
        <button type="submit" className="adm-btn adm-btn-primary" disabled={pending || !dirty}>
          {pending ? (
            <>
              <Loader2 className="adm-spin" /> Saving…
            </>
          ) : (
            "Update payment"
          )}
        </button>
      </div>
    </form>
  );
}
