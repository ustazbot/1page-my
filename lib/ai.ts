import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

const provider = (process.env.AI_PROVIDER ?? 'claude') as 'claude' | 'deepseek'

const claudeClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const deepseekClient = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
})

const MODELS = {
  claude: process.env.AI_MODEL_CLAUDE ?? 'claude-sonnet-4-6',
  deepseek: process.env.AI_MODEL_DEEPSEEK ?? 'deepseek-v4-pro',
}

export interface AIMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function generateText(
  systemPrompt: string,
  userPrompt: string,
  overrideProvider?: 'claude' | 'deepseek'
): Promise<string> {
  const p = overrideProvider ?? provider

  if (p === 'claude') {
    const response = await claudeClient.messages.create({
      model: MODELS.claude,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })
    const block = response.content[0]
    return block.type === 'text' ? block.text : ''
  }

  const response = await deepseekClient.chat.completions.create({
    model: MODELS.deepseek,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 4096,
  })
  return response.choices[0]?.message?.content ?? ''
}

export async function* streamText(
  systemPrompt: string,
  userPrompt: string,
  overrideProvider?: 'claude' | 'deepseek'
): AsyncGenerator<string> {
  const p = overrideProvider ?? provider

  if (p === 'claude') {
    const stream = await claudeClient.messages.create({
      model: MODELS.claude,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      stream: true,
    })
    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        yield event.delta.text
      }
    }
    return
  }

  const stream = await deepseekClient.chat.completions.create({
    model: MODELS.deepseek,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 4096,
    stream: true,
  })
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content
    if (delta) yield delta
  }
}

export function getActiveProvider() {
  return provider
}

export function getActiveModel() {
  return MODELS[provider]
}
