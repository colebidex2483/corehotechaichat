"use client";

import { MessageSquare, Loader2 } from "lucide-react";
import { Heading } from "@/components/heading";
import ChatWrapper from "@/components/conversation/ChatWrapper";

const ConversationPage = () => {

  return (
    <div className='flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]'>
      <Heading
        title="Conversation"
        description="Our most advanced conversation model."
        icon={MessageSquare}
        iconColor="text-violet-500"
        bgColor="bg-violet-500/10"
      />

      
        <div className=' w-full grow lg:flex xl:px-2'>
        <ChatWrapper />
        </div>
   
    </div>



  );
}

export default ConversationPage;

