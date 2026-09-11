import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Standard page header for every admin route: optional back link, eyebrow,
 * title, lede and a right-aligned action cluster that stacks on mobile.
 */
export default function PageHeader({
  eyebrow,
  title,
  lede,
  back,
  actions,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  back?: { href: string; label: string };
  actions?: React.ReactNode;
}) {
  return (
    <>
      {back && (
        <Link href={back.href} className="adm-back">
          <ArrowLeft /> {back.label}
        </Link>
      )}
      <div className="adm-page-head">
        <div style={{ minWidth: 0 }}>
          {eyebrow && <p className="adm-eyebrow">{eyebrow}</p>}
          <h1 className="adm-h1">{title}</h1>
          {lede && <p className="adm-lede">{lede}</p>}
        </div>
        {actions && <div className="adm-page-actions">{actions}</div>}
      </div>
    </>
  );
}
