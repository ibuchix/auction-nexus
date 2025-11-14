
interface PLNCurrencyProps {
  value: number;
  className?: string;
}

export function PLNCurrency({ value, className }: PLNCurrencyProps) {
  // Ensure value is a valid number
  const numericValue = Number(value) || 0;
  
  // Format the number with Polish locale
  const formattedValue = numericValue.toLocaleString('pl-PL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  // Debug logging
  console.log('PLNCurrency render:', {
    inputValue: value,
    numericValue,
    formattedValue,
    className,
    charCodes: formattedValue.split('').map(c => c.charCodeAt(0))
  });

  // Clean any unexpected characters (keep only digits and spaces)
  const cleanedValue = formattedValue.replace(/[^\d\s]/g, '');

  return <span className={className}>{cleanedValue} zł</span>;
}
