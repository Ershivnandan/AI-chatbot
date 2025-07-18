import { createOpenAI } from '@ai-sdk/openai'
import {
  streamText,
  convertToCoreMessages,
  type Message as ClientMessage,
} from 'ai'
import { getSystemPrompt } from "@/constants"

export const maxDuration = 30

export async function POST(req: Request) {
  const {
    messages,
    language,
  }: { messages: ClientMessage[]; language: string } = await req.json()


  const systemPrompt = getSystemPrompt(language)

  const huggingface = createOpenAI({
    baseURL: 'https://router.huggingface.co/v1',
    apiKey: process.env.NEXT_HF_TOKEN!,
  })

  const result = streamText({
    model: huggingface('moonshotai/Kimi-K2-Instruct:together'),
    system: systemPrompt,
    messages: convertToCoreMessages(messages),
  })

  return result.toDataStreamResponse()
}
