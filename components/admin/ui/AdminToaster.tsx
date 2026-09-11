"use client";

import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useAdminToast } from "@/store/admin-toast";

/** Single toast outlet for the admin console, mounted once in the layout. */
export default function AdminToaster() {
  const toasts = useAdminToast((s) => s.toasts);
  const dismiss = useAdminToast((s) => s.dismiss);
  if (toasts.length === 0) return null;
  return (
    <div className="adm-toaster" role="region" aria-label="Notifications">
      {toasts.map((t) => (
        <div key={t.id} className="adm-toast" data-tone={t.tone} role="status" aria-live="polite">
          {t.tone === "ok" ? <CheckCircle2 /> : t.tone === "danger" ? <AlertCircle /> : <Info />}
          <span>{t.message}</span>
          <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss notification">
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>
      ))}
    </div>
  );
}
