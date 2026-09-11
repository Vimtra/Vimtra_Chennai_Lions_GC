"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { adminToast } from "@/store/admin-toast";

/**
 * Turns `?saved=1`, `?error=…` and `?notice=…` in the URL into a toast, then
 * strips them so a reload or a shared link never re-announces a stale
 * message. Server actions that must redirect (e.g. after creating a row)
 * use these params; everything else reports its result directly.
 */
const SAVED: Record<string, string> = {
  "1": "Saved.",
  created: "Created.",
  updated: "Changes saved.",
  deleted: "Deleted.",
  published: "Published.",
};
const ERRORS: Record<string, string> = {
  missing: "That record no longer exists.",
  invalid: "Some fields were missing or invalid. Nothing was saved.",
};

export default function FlashParams() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const done = useRef<string | null>(null);

  useEffect(() => {
    const saved = params.get("saved");
    const error = params.get("error");
    const notice = params.get("notice");
    const key = `${pathname}|${saved}|${error}|${notice}`;
    if (!saved && !error && !notice) return;
    if (done.current === key) return;
    done.current = key;

    if (saved) adminToast(SAVED[saved] ?? "Saved.", "ok");
    if (error) adminToast(ERRORS[error] ?? error, "danger");
    if (notice) adminToast(notice, "info");

    const next = new URLSearchParams(params.toString());
    next.delete("saved");
    next.delete("error");
    next.delete("notice");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [params, pathname, router]);

  return null;
}
