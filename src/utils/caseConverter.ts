
/**
 * Convert camelCase to snake_case
 */
export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Convert snake_case to camelCase
 */
export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert an object's keys from camelCase to snake_case
 */
export function objectToSnakeCase<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = toSnakeCase(key);
    
    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      result[snakeKey] = objectToSnakeCase(value);
    } else if (Array.isArray(value)) {
      result[snakeKey] = value.map(item => 
        item && typeof item === 'object' && !(item instanceof Date) 
          ? objectToSnakeCase(item) 
          : item
      );
    } else {
      result[snakeKey] = value;
    }
  }
  
  return result;
}

/**
 * Convert an object's keys from snake_case to camelCase
 */
export function objectToCamelCase<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = toCamelCase(key);
    
    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      result[camelKey] = objectToCamelCase(value);
    } else if (Array.isArray(value)) {
      result[camelKey] = value.map(item => 
        item && typeof item === 'object' && !(item instanceof Date) 
          ? objectToCamelCase(item) 
          : item
      );
    } else {
      result[camelKey] = value;
    }
  }
  
  return result;
}
