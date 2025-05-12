
interface PLNCurrencyProps {
  value: number;
  className?: string;
}

export function PLNCurrency({ value, className }: PLNCurrencyProps) {
  const formattedValue = new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

  return <span className={className}>{formattedValue}</span>;
}
