import { NextRequest, NextResponse } from "next/server"
import Groq from "groq-sdk"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

// System prompt with context about the ThermoTrace application
const SYSTEM_PROMPT = `You are ThermoTrace AI, an intelligent assistant for a thermal cooling control monitoring system.

Context about the application:
- ThermoTrace is a real-time AI cooling control dashboard
- It monitors and controls HVAC (Heating, Ventilation, and Air Conditioning) systems
- The system tracks metrics like cooling tons, power consumption (kW), temperatures, and flow rates
- It uses AI agents to make intelligent control decisions
- The dashboard displays:
  * Real-time thermal metrics and sensor data
  * Agent decision traces and execution flowcharts
  * Safety validation checks and performance metrics
  * Control decision summaries with impact analysis
  * Energy efficiency calculations

Your role:
- Answer questions about thermal monitoring, HVAC systems, and energy efficiency
- Explain cooling system metrics and their significance
- Help users understand the AI agent's decisions
- Provide insights on energy optimization
- Explain safety violations and anomalies
- Be concise, accurate, and helpful
- Use technical terms when appropriate but explain them clearly

IMPORTANT: Do not use markdown formatting. Write in plain text without asterisks (*), underscores (_), or other markdown symbols. Use simple, clear language.

Always be professional, helpful, and context-aware of the thermal cooling domain.`

// Filter markdown formatting from response
function removeMarkdown(text: string): string {
  return text
    // Remove bold/italic asterisks and underscores
    .replace(/\*\*([^*]+)\*\*/g, '$1')  // **bold** -> bold
    .replace(/\*([^*]+)\*/g, '$1')       // *italic* -> italic
    .replace(/__([^_]+)__/g, '$1')       // __bold__ -> bold
    .replace(/_([^_]+)_/g, '$1')         // _italic_ -> italic
    // Remove headers
    .replace(/^#{1,6}\s+/gm, '')         // ### Header -> Header
    // Remove list markers (keep the content)
    .replace(/^\s*[-*+]\s+/gm, '• ')     // - item -> • item
    .replace(/^\s*\d+\.\s+/gm, '')       // 1. item -> item
    // Remove code blocks but keep content
    .replace(/```[\s\S]*?```/g, (match) => {
      return match.replace(/```\w*\n?/g, '').trim()
    })
    .replace(/`([^`]+)`/g, '$1')         // `code` -> code
    // Remove links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // [text](url) -> text
    // Clean up extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages format" },
        { status: 400 }
      )
    }

    // Prepare messages with system prompt
    const formattedMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.slice(-6), // Keep last 6 messages for context (3 exchanges)
    ]

    // Call Groq API with LLaMA model
    const completion = await groq.chat.completions.create({
      messages: formattedMessages as any,
      model: "llama-3.3-70b-versatile", // Fast and powerful LLaMA model
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
    })

    const rawContent = completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again."

    // Remove markdown formatting for clean text display
    const cleanContent = removeMarkdown(rawContent)

    return NextResponse.json({
      content: cleanContent,
      model: completion.model,
      usage: completion.usage,
    })
  } catch (error: any) {
    console.error("Groq API Error:", error)

    // Fallback response if API fails
    return NextResponse.json(
      {
        content: "I'm having trouble connecting to my AI service. However, I can still help! Please try rephrasing your question or ask about thermal monitoring, cooling systems, or energy efficiency.",
        error: error.message,
      },
      { status: 200 } // Return 200 with fallback message
    )
  }
}
