import 'server-only'
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages'
import type { Message } from '@/db/schema'
import type { CoachPersona } from './personas'

type IntakeData = {
  age?: number
  gender?: string
  heightDisplay?: string
  weightDisplay?: string
  goal?: string
  activityLevel?: string
  experienceLevel?: string
  location?: string
  injuries?: string
  medicalConditions?: string
  dietaryRestrictions?: string
}

function formatIntake(data: IntakeData): string {
  const lines: string[] = []
  if (data.age) lines.push(`- Age: ${data.age}`)
  if (data.gender) lines.push(`- Gender: ${data.gender}`)
  if (data.heightDisplay) lines.push(`- Height: ${data.heightDisplay}`)
  if (data.weightDisplay) lines.push(`- Weight: ${data.weightDisplay}`)
  if (data.goal) lines.push(`- Primary Goal: ${data.goal}`)
  if (data.activityLevel) lines.push(`- Activity Level: ${data.activityLevel}`)
  if (data.experienceLevel) lines.push(`- Experience Level: ${data.experienceLevel}`)
  if (data.location) lines.push(`- Location: ${data.location}`)
  if (data.injuries) lines.push(`- Injuries / Limitations: ${data.injuries}`)
  if (data.medicalConditions) lines.push(`- Medical Conditions: ${data.medicalConditions}`)
  if (data.dietaryRestrictions) lines.push(`- Dietary Restrictions: ${data.dietaryRestrictions}`)
  return lines.join('\n')
}

// builds the system prompt text from persona + member intake
// this entire block gets prompt-cached
export function buildSystemPrompt(
  persona: CoachPersona,
  intake: unknown | null,
): string {
  let prompt = persona.systemPrompt

  const data = intake as IntakeData | null
  if (data) {
    const formatted = formatIntake(data)
    if (formatted) {
      prompt += '\n\n## Member Profile\n' + formatted
    }
  }

  return prompt
}

// converts DB message rows into the alternating user/assistant array Claude expects
// history should NOT include the current in-flight user message
export function buildMessages(
  history: Message[],
  currentContent: string,
): MessageParam[] {
  const past: MessageParam[] = history
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

  return [...past, { role: 'user', content: currentContent }]
}
