import { z } from 'zod'
import { router, publicProcedure } from '../trpc'
import { db } from '../db'
import { conversations, messages, creditTransactions } from '../db/schema'
import { eq } from 'drizzle-orm'

export const chatRouter = router({
  // Criar nova conversa
  createConversation: publicProcedure
    .input(z.object({
      userId: z.string(),
      title: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const [conversation] = await db.insert(conversations).values({
        userId: input.userId,
        title: input.title || 'Nova Conversa',
      }).returning()
      
      return conversation
    }),

  // Listar conversas do usuário
  listConversations: publicProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .query(async ({ input }) => {
      return await db.query.conversations.findMany({
        where: eq(conversations.userId, input.userId),
        orderBy: (conversations, { desc }) => [desc(conversations.updatedAt)],
      })
    }),

  // Enviar mensagem
  sendMessage: publicProcedure
    .input(z.object({
      conversationId: z.string(),
      content: z.string(),
      userId: z.string(),
    }))
    .mutation(async ({ input }) => {
      // Salvar mensagem do usuário
      const [userMessage] = await db.insert(messages).values({
        conversationId: input.conversationId,
        role: 'user',
        content: input.content,
      }).returning()

      // Aqui você integraria com a API da OpenAI
      // Por enquanto, vamos retornar uma resposta simulada
      const assistantResponse = `Recebi sua mensagem: "${input.content}". Em breve vou processar e gerar conteúdo para você!`

      const [assistantMessage] = await db.insert(messages).values({
        conversationId: input.conversationId,
        role: 'assistant',
        content: assistantResponse,
        metadata: {
          tokensUsed: 0,
          cost: 0,
        },
      }).returning()

      return {
        userMessage,
        assistantMessage,
      }
    }),

  // Obter mensagens de uma conversa
  getMessages: publicProcedure
    .input(z.object({
      conversationId: z.string(),
    }))
    .query(async ({ input }) => {
      return await db.query.messages.findMany({
        where: eq(messages.conversationId, input.conversationId),
        orderBy: (messages, { asc }) => [asc(messages.createdAt)],
      })
    }),
})

