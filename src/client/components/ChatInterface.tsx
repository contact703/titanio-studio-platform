import { useState, useEffect } from 'react'
import { trpc } from '../utils/trpc'

export default function ChatInterface() {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const userId = 'demo-user' // Temporário - será substituído por autenticação real

  // Criar conversa ao montar o componente
  const createConversation = trpc.chat.createConversation.useMutation({
    onSuccess: (data) => {
      setConversationId(data.id)
    },
  })

  // Enviar mensagem
  const sendMessage = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      setMessage('')
      messagesQuery.refetch()
    },
  })

  // Buscar mensagens
  const messagesQuery = trpc.chat.getMessages.useQuery(
    { conversationId: conversationId! },
    { enabled: !!conversationId }
  )

  useEffect(() => {
    createConversation.mutate({ userId })
  }, [])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !conversationId) return

    sendMessage.mutate({
      conversationId,
      content: message,
      userId,
    })
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">Titanio Studio</h1>
        </div>
        
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg mb-4">
          + Nova Conversa
        </button>

        <div className="space-y-2">
          <div className="text-sm text-gray-400">Conversas Recentes</div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Chat Conversacional</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">💎 100 créditos</span>
            <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!conversationId ? (
            <div className="text-center text-gray-500 mt-20">
              <p className="text-xl mb-2">Criando conversa...</p>
            </div>
          ) : messagesQuery.isLoading ? (
            <div className="text-center text-gray-500 mt-20">
              <p>Carregando mensagens...</p>
            </div>
          ) : (
            messagesQuery.data?.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-2xl px-4 py-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="bg-white border-t p-4">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
            <div className="flex space-x-4">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Descreva sua ideia..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                disabled={!conversationId || sendMessage.isPending}
              />
              <button
                type="submit"
                disabled={!conversationId || sendMessage.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendMessage.isPending ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

