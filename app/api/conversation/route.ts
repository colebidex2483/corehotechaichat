import prismadb from "@/lib/prismadb";
import { openai } from '@/lib/openai'
import { SendMessageValidator } from '@/lib/validators/SendMessageValidatorCon'
import { auth } from "@clerk/nextjs";
import { NextRequest } from 'next/server'
import { OpenAIStream, StreamingTextResponse } from 'ai'


export const POST = async (req: NextRequest) => {
  // endpoint for asking a question to a pdf file

  const body = await req.json()

  const { userId } = auth();

  if (!userId)
    return new Response('Unauthorized', { status: 401 })

  const { message } = SendMessageValidator.parse(body)


  await prismadb.conversationMessage.create({
    data: {
      text: message,
      isUserMessage: true,
      userId,
    },
  })

  const prevMessages = await prismadb.conversationMessage.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'asc',
    },
    take: 6,
  })

  const formattedPrevMessages = prevMessages.map((msg) => ({
    role: msg.isUserMessage
      ? ('user' as const)
      : ('assistant' as const),
    content: msg.text,
  }))

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    stream: true,
    messages: [
      {
        role: 'system',
        content:
          'Use the following pieces of context (or previous conversation if needed) to answer the users question in markdown format.',
      },
      {
        role: 'user',
        content:`${message}
        
  \n----------------\n
  
  PREVIOUS CONVERSATION:
  ${formattedPrevMessages.map((message) => {
    if (message.role === 'user')
      return `User: ${message.content}\n`
    return `Assistant: ${message.content}\n`
  })} 
  
  \n----------------\n


`,
    },
  ],
})

  const stream = OpenAIStream(response, {
    async onCompletion(completion) {
      await prismadb.conversationMessage.create({
        data: {
          text: completion,
          isUserMessage: false,
          userId,
        },
      })
    },
  })

  return new StreamingTextResponse(stream)
}
