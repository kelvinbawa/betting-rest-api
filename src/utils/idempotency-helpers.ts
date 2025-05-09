import { v4 as uuidv4 } from 'uuid';

export const generateIdempotencyKey = (): string => {
  return uuidv4();
};


export const isValidIdempotencyKey = (key: string): boolean => {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidPattern.test(key);
};