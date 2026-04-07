import { NextRequest, NextResponse } from "next/server";

const CEREBRAS_API_KEY = process.env.CEREBRAS_API_KEY;
const CEREBRAS_API_URL = "https://api.cerebras.ai/v1/chat/completions";

const SYSTEM_PROMPT = `You are BRANCED, a professional AI assistant that guides users step-by-step through any domain or subject. You are an expert in providing structured, actionable guidance.

Your responsibilities:
1. UNDERSTAND the user's domain/subject and goals deeply
2. GUIDE them through a structured multi-step process
3. PROVIDE specific, actionable suggestions at each step
4. ASK follow-up questions to refine guidance
5. IDENTIFY key findings and insights throughout the process
6. SUMMARIZE results with data-driven conclusions at the end

Response format rules:
- Be concise but thorough
- Use numbered steps when providing guidance
- Highlight key findings with "KEY FINDING:" prefix
- When asking follow-ups, prefix with "FOLLOW-UP:"
- When providing suggestions, prefix with "SUGGESTION:"
- At the end of a complete guidance session, provide a "SUMMARY:" section with structured data

When the user completes all steps, provide a final analysis in this JSON format wrapped in <analysis> tags:
<analysis>
{
  "domain": "the domain/subject",
  "title": "descriptive title of the guidance",
  "steps_completed": number,
  "key_findings": ["finding1", "finding2", ...],
  "scores": {"category1": score1, "category2": score2, ...},
  "recommendations": ["rec1", "rec2", ...],
  "risk_level": "low|medium|high",
  "confidence": 0.0-1.0,
  "breakdown": [{"label": "cat1", "value": num}, {"label": "cat2", "value": num}]
}
</analysis>

Always maintain context across the conversation and remember previous responses.`;

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, formData } = body;

    if (!CEREBRAS_API_KEY) {
      return NextResponse.json(
        { error: "CEREBRAS_API_KEY not configured" },
        { status: 500 }
      );
    }

    const systemMessage: Message = {
      role: "system",
      content: SYSTEM_PROMPT,
    };

    // If formData is provided, inject it as context
    const contextMessages: Message[] = [systemMessage];
    if (formData) {
      contextMessages.push({
        role: "user",
        content: `Here is the user's onboarding data:\n${JSON.stringify(formData, null, 2)}\n\nPlease analyze this data and provide a comprehensive final analysis with the <analysis> JSON block.`,
      });
    }

    const allMessages: Message[] = [
      ...contextMessages,
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const response = await fetch(CEREBRAS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CEREBRAS_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-4-scout-17b-16e-instruct",
        messages: allMessages,
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Cerebras API error:", errorData);
      return NextResponse.json(
        { error: "Failed to get AI response", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || "";

    // Extract analysis JSON if present
    let analysis = null;
    const analysisMatch = assistantMessage.match(
      /<analysis>([\s\S]*?)<\/analysis>/
    );
    if (analysisMatch) {
      try {
        analysis = JSON.parse(analysisMatch[1].trim());
      } catch {
        // analysis parsing failed, continue without it
      }
    }

    return NextResponse.json({
      message: assistantMessage.replace(/<analysis>[\s\S]*?<\/analysis>/, "").trim(),
      analysis,
      usage: data.usage,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
