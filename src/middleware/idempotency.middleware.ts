import { Request, Response, NextFunction } from 'express';

const idempotencyStore = new Map<string, {
  response: any;
  status: number;
  expiresAt: number;
}>();

/* 
  Clean up expired keys periodically.
  Set intervals runs in a separate process, this can serve as a background job.
  I'm leaving this here as a reminder for my interview walkthrough
*/
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of idempotencyStore.entries()) {
    if (value.expiresAt < now) {
      idempotencyStore.delete(key);
    }
  }
}, 60000); 


export const idempotencyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return next();
  }

  const idempotencyKey = req.header('Idempotency-Key');
  
  if (!idempotencyKey) {
    return next();
  }

  const cachedResponse = idempotencyStore.get(idempotencyKey);
  
  if (cachedResponse) {
    return res.status(cachedResponse.status).json(cachedResponse.response);
  }

  const originalSend = res.send;

  res.send = function(body) {
    idempotencyStore.set(idempotencyKey, {
      response: body,
      status: res.statusCode,
      expiresAt: Date.now() + 3600000 // Store for 1 hour
    });

    return originalSend.call(this, body);
  };

  next();
};

