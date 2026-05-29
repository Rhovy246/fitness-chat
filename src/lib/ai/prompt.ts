import 'server-only'
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages'
import type { Message } from '@/db/schema'
import { TRENADOR_AI_SYSTEM_PROMPT } from './personas'

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
  coachAssigned?: boolean
  coachFirstName?: string
}

function formatMemberContext(data: IntakeData): string {
  const lines: string[] = ['MEMBER PROFILE']
  if (data.age) lines.push(`Age: ${data.age}`)
  if (data.gender) lines.push(`Gender: ${data.gender}`)
  if (data.heightDisplay) lines.push(`Height: ${data.heightDisplay}`)
  if (data.weightDisplay) lines.push(`Weight: ${data.weightDisplay}`)
  if (data.goal) lines.push(`Primary Goal: ${data.goal}`)
  if (data.activityLevel) lines.push(`Activity Level: ${data.activityLevel}`)
  if (data.experienceLevel) lines.push(`Experience: ${data.experienceLevel}`)
  if (data.location) lines.push(`Location: ${data.location}`)
  if (data.injuries) lines.push(`Injuries / Limitations: ${data.injuries}`)
  if (data.medicalConditions) lines.push(`Medical Conditions: ${data.medicalConditions}`)
  if (data.dietaryRestrictions) lines.push(`Dietary Restrictions: ${data.dietaryRestrictions}`)

  const coachLine = data.coachAssigned
    ? `Coach assigned: yes${data.coachFirstName ? ` — ${data.coachFirstName}` : ''}`
    : 'Coach assigned: no (member can request one from the home screen)'
  lines.push(coachLine)

  return lines.join('\n')
}

// layers 1+2 (safety preamble + persona) are static and get a shared cache prefix
// layer 4 (member context snapshot) is per-member and injected after the cached block
export function buildSystemPrompt(intake: unknown | null): string {
  const data = intake as IntakeData | null
  if (!data) return TRENADOR_AI_SYSTEM_PROMPT

  const context = formatMemberContext(data)
  return `${TRENADOR_AI_SYSTEM_PROMPT}\n\n---\n\n${context}`
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
