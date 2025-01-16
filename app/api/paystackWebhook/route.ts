import { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
import cors from 'cors';
import prismadb from "@/lib/prismadb"

import { verifyWebhookSignature, handleChargeSuccessEvent } from '@/lib/paystack';  // Update this import path

const corsMiddleware = cors();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await new Promise<void>((resolve, reject) => {
    corsMiddleware(req, res, (err?: any) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });

  if (req.method === 'POST') {
    try {
      const buf = await buffer(req);
      const secret = process.env.PAYSTACK_SECRET_KEY;

      // Verify Paystack webhook signature
      if (verifyWebhookSignature(secret, req.headers as Record<string, string | string[]>, buf)) {
        const event = JSON.parse(buf.toString());

        // Handle Paystack events based on event type
        if (event.event === 'charge.success') {
          // Handle charge.success event
          handleChargeSuccessEvent(event.data);
          // const userData = event.data.customer;
          
          // try {
          //   // Save user information to database using Prism
          //   const newUser = await prismadb.userSubscription.create({
          //     data: {
          //       name: userData.name,
          //       email: userData.email,
          //       phone: userData.phone,
          //       // Add other user properties as needed
          //     },
          //   });
    
          //   res.status(200).json({ message: 'User information saved successfully' });
          // } catch (error) {
          //   res.status(500).json({ error: 'Error saving user information' });
          // }
       
          // Respond to Paystack
          res.status(200).json({ received: true });
        } else {
          res.status(400).json({ error: 'Unsupported event type' });
        }
      } else {
        res.status(401).json({ error: 'Invalid signature' });
      }
    } catch (error) {
      console.error('Error processing Paystack webhook:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
