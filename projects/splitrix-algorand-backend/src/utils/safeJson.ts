/**
 * Recursively converts BigInt values to numbers in an object
 * This is necessary because BigInt cannot be serialized to JSON
 */
export function safeJson(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle BigInt - convert to number
  if (typeof obj === 'bigint') {
    // Convert BigInt to number
    // Note: Values outside Number.MAX_SAFE_INTEGER may lose precision
    // For Algorand microAlgos, this should be safe for practical amounts
    return Number(obj);
  }

  // Handle Date objects
  if (obj instanceof Date) {
    return obj.toISOString();
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => safeJson(item));
  }

  // Handle objects
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = safeJson(obj[key]);
      }
    }
    return result;
  }

  // Return primitive values as-is
  return obj;
}

