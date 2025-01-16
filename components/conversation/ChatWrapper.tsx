'use client'

import ChatInput from './ChatInput'
import Messages from './Messages'

import { ChatContextProvider } from './ChatContext'
// import { PLANS } from '@/config/stripe'

interface ChatWrapperProps {

  // isSubscribed: boolean
}

const ChatWrapper = ({
  // isSubscribed,
}: ChatWrapperProps) => {
  

  return (
    <ChatContextProvider>
          <Messages />

        <ChatInput />
     
     </ChatContextProvider>
  )
}

export default ChatWrapper
