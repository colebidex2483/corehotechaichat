import { auth, currentUser } from "@clerk/nextjs";
import { redirect } from 'next/navigation'
import prismadb from "@/lib/prismadb";
import pdf from '@/components/pdf'
const Page = async () => {

    const user = await currentUser();
    if (!user || !user.id) redirect('/auth-callback?origin=dashboard')

    const dbUser = await prismadb.userSubscription.findFirst({
      where: {
        id: user.id
      }
    })
}

export default Page