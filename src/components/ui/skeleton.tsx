import { cn } from "@/lib/utils";

/** Placeholder con shimmer platino. Solo se muestra si la carga pasa 150 ms (ver useDelayedFlag). */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-md bg-shimmer animate-shimmer", className)} {...props} />;
}

export { Skeleton };
