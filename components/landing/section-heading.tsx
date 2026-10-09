import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  titleId,
  description,
  center,
}: {
  eyebrow: string;
  title: ReactNode;
  titleId: string;
  description?: ReactNode;
  center?: boolean;
}) {
  return (
    <div className={`dl-section-head${center ? " is-center" : ""}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={titleId}>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  );
}
