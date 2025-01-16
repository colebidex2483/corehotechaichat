'use client'
import { trpc } from "@/app/_trpc/client"
// import { SubContent } from "@radix-ui/react-dropdown-menu"
import { Loader2 } from 'lucide-react'
import Pdf from '@/components/pdf'
import { useRouter,useSearchParams } from "next/navigation"

const Page = () =>{
  // const router = useRouter()
  // const { data,isLoading } = trpc.authCallback.useQuery(undefined, {

    
  //   // onSuccess: ({ success }) => {
  //   //   console.log('Success from server:', success); 
  //   //   if (success) {
  //   //     // user is synced to db
  //   //     router.push('/dashboard')
  //   //   }
  //   // },
  //   // onError: (err) => {
  //   //   if (err.data?.code === 'UNAUTHORIZED') {
  //   //     router.push('/sign-in')
  //   //   }
  //   // },
  //   retry: true,
  //   retryDelay: 500,
  // })
  
  return <Pdf />
}
export default Page