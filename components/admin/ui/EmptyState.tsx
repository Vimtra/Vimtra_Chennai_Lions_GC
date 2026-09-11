import { Inbox } from "lucide-react";

/**
 * Intentional empty state. Says what is missing and, where there is one,
 * offers the single action that fills it — never a placeholder row.
 */
export default function EmptyState({
  icon,
  title,
  body,
  actions,
  compact,
}: {
  icon?: React.ReactNode;
  title: string;
  body?: React.ReactNode;
  actions?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={`adm-empty ${compact ? "is-compact" : ""}`}>
      {icon ?? <Inbox />}
      <div className="adm-empty-title">{title}</div>
      {body && <p>{body}</p>}
      {actions && <div className="adm-empty-actions">{actions}</div>}
    </div>
  );
}
