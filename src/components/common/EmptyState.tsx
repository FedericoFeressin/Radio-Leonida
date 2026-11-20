import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-state__orbit" aria-hidden="true">
        <span />
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
      {children && <div className="empty-state__actions">{children}</div>}
    </div>
  );
}
