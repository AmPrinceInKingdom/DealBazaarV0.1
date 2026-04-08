import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
