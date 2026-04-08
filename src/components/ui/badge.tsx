import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "danger" | "success";

const styles: Record<BadgeVariant, string> = {
  default: "bg-primary/10 text-primary",
  secondary: "bg-muted text-muted-foreground",
  danger: "bg-danger/10 text-danger",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

export function Badge({
  className,
  variant = "default",
  children,
}: {
  className?: string;
  variant?: BadgeVariant;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
