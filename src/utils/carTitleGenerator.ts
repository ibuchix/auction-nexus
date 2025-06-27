
/**
 * Generates a proper car title from make, model, and year
 * Format: "{year} {make} {model}"
 * Example: "2019 BMW M8"
 */
export function generateCarTitle(make: string, model: string, year: number): string {
  if (!make || !model || !year) {
    throw new Error('Make, model, and year are required to generate a car title');
  }
  
  return `${year} ${make.toUpperCase()} ${model.toUpperCase()}`;
}

/**
 * Checks if a title is generic or invalid
 */
export function isGenericTitle(title: string | null | undefined): boolean {
  if (!title) return true;
  
  const genericTitles = [
    'Car Listing',
    'Unknown',
    'Untitled',
    'New Car',
    'Vehicle'
  ];
  
  return genericTitles.some(generic => 
    title.toLowerCase().includes(generic.toLowerCase())
  );
}
