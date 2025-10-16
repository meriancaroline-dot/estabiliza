import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  type?: "card" | "list" | "text" | "avatar";
  count?: number;
  className?: string;
}

export function LoadingSkeleton({ type = "card", count = 1, className }: LoadingSkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  const renderSkeleton = () => {
    switch (type) {
      case "card":
        return items.map((i) => (
          <div key={i} className={cn("bg-muted rounded-lg h-32 w-full animate-pulse", className)} />
        ));
      case "list":
        return items.map((i) => (
          <div key={i} className="space-y-3">
            <div className={cn("bg-muted rounded h-4 w-3/4 animate-pulse", className)} />
            <div className={cn("bg-muted rounded h-4 w-1/2 animate-pulse", className)} />
          </div>
        ));
      case "text":
        return items.map((i) => (
          <div key={i} className={cn("bg-muted rounded h-4 animate-pulse", className)} />
        ));
      case "avatar":
        return items.map((i) => (
          <div key={i} className={cn("bg-muted rounded-full h-12 w-12 animate-pulse", className)} />
        ));
      default:
        return null;
    }
  };

  return <div className="space-y-4">{renderSkeleton()}</div>;
}
