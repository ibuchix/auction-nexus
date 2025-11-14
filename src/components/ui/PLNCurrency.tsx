
interface PLNCurrencyProps {
  value: number;
  className?: string;
}

export function PLNCurrency({ value, className }: PLNCurrencyProps) {
  const formattedValue = value.toLocaleString('pl-PL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return <span className={className}>{formattedValue} zł</span>;
}
