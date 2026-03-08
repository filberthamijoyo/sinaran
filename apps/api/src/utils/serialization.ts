/**
 * Recursively converts BigInt values to strings in an object
 * This is necessary because JSON.stringify cannot serialize BigInt values
 */
export function serializeBigInt<T>(obj: T): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'bigint') {
    return obj.toString();
  }

  // Preserve Date values (avoid converting them into `{}`)
  if (obj instanceof Date) {
    return obj.toISOString();
  }

  if (Array.isArray(obj)) {
    return obj.map(item => serializeBigInt(item));
  }

  // Preserve Prisma Decimal / other JSON-serializable objects (avoid converting them into `{}`)
  // Prisma Decimal instances implement `toJSON()` which returns a string.
  if (typeof obj === 'object') {
    const anyObj = obj as any;
    if (typeof anyObj?.toJSON === 'function' && Object.getPrototypeOf(anyObj) !== Object.prototype) {
      return anyObj.toJSON();
    }
  }

  if (typeof obj === 'object') {
    const serialized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeBigInt(value);
    }
    return serialized;
  }

  return obj;
}
