import { auth, currentUser } from "@clerk/nextjs";
import {
  privateProcedure,
  publicProcedure,
  router,
} from './trpc'
import { TRPCError } from '@trpc/server'
import prismadb from "@/lib/prismadb";
import { z } from 'zod'
import { INFINITE_QUERY_LIMIT } from '@/config/infinite-query'
// import { stripe } from "@/lib/stripe";

export const appRouter = router({

  authCallback: publicProcedure.query(async () => {
    // const { userId } = auth();
    const user = await currentUser();

    if (!user?.id || !user?.emailAddresses[0].emailAddress)
      throw new TRPCError({ code: 'UNAUTHORIZED' })

    // check if the user is in the database
    const dbUser = await prismadb.userSubscription.findFirst({
      where: {
        userId: user.id
      }
    })
    if (!dbUser) {
      // create user in db
      await prismadb.userSubscription.create({
        data: {
          userId: user.id
        },
      })
    }

    return { success: true }

  }),


  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx
// console.log(userId)
    return await prismadb.file.findMany({
      where: {
        userId,
      },
    })
  }),

getConversationMessages: privateProcedure.input(
  z.object({
    limit: z.number().min(1).max(100).nullish(),
    cursor: z.string().nullish(),
    // userId: z.string(),
  })
)  .query(async ({ ctx, input }) => {
  const { userId } = ctx
  const { cursor } = input
  const limit = input.limit ?? INFINITE_QUERY_LIMIT

  const messages = await prismadb.conversationMessage.findMany({
    take: limit + 1,
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    cursor: cursor ? { id: cursor } : undefined,
    select: {
      id: true,
      isUserMessage: true,
      createdAt: true,
      text: true,
    },
  })

  let nextCursor: typeof cursor | undefined = undefined
  if (messages.length > limit) {
    const nextItem = messages.pop()
    nextCursor = nextItem?.id
  }

  return {
    messages,
    nextCursor,
  }
}),

  getFileMessages: privateProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        fileId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx
      const { fileId, cursor } = input
      const limit = input.limit ?? INFINITE_QUERY_LIMIT

      const file = await prismadb.file.findFirst({
        where: {
          id: fileId,
          userId,
        },
      })

      if (!file) throw new TRPCError({ code: 'NOT_FOUND' })

      const messages = await prismadb.message.findMany({
        take: limit + 1,
        where: {
          fileId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        cursor: cursor ? { id: cursor } : undefined,
        select: {
          id: true,
          isUserMessage: true,
          createdAt: true,
          text: true,
        },
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (messages.length > limit) {
        const nextItem = messages.pop()
        nextCursor = nextItem?.id
      }

      return {
        messages,
        nextCursor,
      }
    }),



  getFileUploadStatus: privateProcedure
    .input(z.object({ fileId: z.string() }))
    .query(async ({ input, ctx }) => {
      const file = await prismadb.file.findFirst({
        where: {
          id: input.fileId,
          userId: ctx.userId,
        },
      })

      if (!file) return { status: 'PENDING' as const }

      return { status: file.uploadStatus }
    }),

  getFile: privateProcedure
  .input(z.object({ key: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const { userId } = ctx

    const file = await prismadb.file.findFirst({
      where: {
        key: input.key,
        userId,
      },
    })

    if (!file) throw new TRPCError({ code: 'NOT_FOUND' })

    return file
  }),

  deleteFile: privateProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const { userId } = ctx

    const file = await prismadb.file.findFirst({
      where: {
        id: input.id,
        userId,
      },
    })

    if (!file) throw new TRPCError({ code: 'NOT_FOUND' })

    await prismadb.file.delete({
      where: {
        id: input.id,
      },
    })

    return file
  }),
})

export type AppRouter = typeof appRouter
