import Navbar from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { checkSubscription } from "@/lib/subscription";
import { getApiLimitCount } from "@/lib/api-limit";
import { Toaster } from "@/components/ui/toaster";
// import { Inter } from 'next/font/google'

import 'react-loading-skeleton/dist/skeleton.css'
import 'simplebar-react/dist/simplebar.min.css'

const DashboardLayout = async ({
  children,
}: {
  children: React.ReactNode
}) => {
  const apiLimitCount = await getApiLimitCount();
  const isPro = await checkSubscription();

  return ( 
    <div className="h-full w-[100%] relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col z-40 md:fixed md:inset-y-0 z-80 bg-gray-900">
        <Sidebar isPro={isPro} apiLimitCount={apiLimitCount} />
      </div>



      <main className="md:pl-72 pb-10 w-[100%] fixed ">
        <Toaster />
        <Navbar />
        <div className=" w-[100%]">
         
        {children}
        </div>
       
      </main>
    </div>
   );
}
 
export default DashboardLayout;
