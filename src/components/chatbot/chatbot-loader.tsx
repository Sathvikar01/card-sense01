'use client'

import dynamic from 'next/dynamic'

const ChatbotWidget = dynamic(
  () => import('./chatbot-widget').then((mod) => mod.ChatbotWidget),
  { ssr: false }
)

export function ChatbotLoader() {
  return <ChatbotWidget />
}
