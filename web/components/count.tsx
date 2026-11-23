/** A tabular count that does a small scale bump whenever it changes. */
export function Count({ value }: { value: number }) {
  return (
    <span key={value} className="inline-block animate-bump text-[11px] text-muted-foreground tabular-nums">
      {value}
    </span>
  );
}
