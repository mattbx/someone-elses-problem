import { Badge } from "@/components/ui/badge";

/** A count badge that does a small scale bump whenever it changes. */
export function Count({ value }: { value: number }) {
  return (
    <Badge key={value} variant="secondary" className="animate-bump tabular-nums">
      {value}
    </Badge>
  );
}
