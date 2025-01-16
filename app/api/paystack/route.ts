import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { absoluteUrl } from "@/lib/utils";
import axios from "axios";
import prismadb from "@/lib/prismadb";

const settingsUrl = absoluteUrl("/settings");
const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY; // Replace with your actual Paystack secret key

export async function GET() {
  try {
    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userSubscription = await prismadb.userSubscription.findUnique({
      where: {
        userId,
      },
    });

    // if (userSubscription && userSubscription.paystackCustomerId) {
    //   // Redirect to Paystack subscription management page
    //   const paystackSubscriptionUrl = `https://dashboard.paystack.com/subscription/${userSubscription.paystackCustomerId}`;
    //   return new NextResponse(JSON.stringify({ url: paystackSubscriptionUrl }));
    // }

    // Create Paystack subscription
    const paystackSubscription = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: user.emailAddresses[0].emailAddress,
        amount: "500000",
        plan: "PLN_3r20e8dtqafaxuu", // Replace with your actual Paystack plan ID
        // Add other Paystack subscription parameters as needed
      },
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
        },
      }
    );

    return new NextResponse(JSON.stringify({ url: paystackSubscription.data.data.authorization_url }));
  } catch (error) {
    console.error("[PAYSTACK_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}