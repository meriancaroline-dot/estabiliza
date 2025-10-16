import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, icon, action, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between pb-6 border-b", className)}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="text-3xl">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
}
