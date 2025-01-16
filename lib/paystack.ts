import crypto from 'crypto';

export const verifyWebhookSignature = (
  secret: string | undefined,
  headers: Record<string, string | string[]>,
  payload: Buffer
): boolean => {
  const signature = headers['x-paystack-signature'];

  if (!secret || !signature) {
    return false;
  }

  const hash = crypto.createHmac('sha512', secret)
    .update(payload)
    .digest('hex');

  return signature === hash;
};

export const handleChargeSuccessEvent = (data: any): void => {
  // Implement your logic to handle charge.success event
  console.log('Charge successful:', data);
  // Update your database, send notifications, etc.
};




