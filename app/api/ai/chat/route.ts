import {
  convertToModelMessages,
  streamText,
  UIMessage,
} from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, context }: { messages: UIMessage[]; context?: any } = await req.json();

  let systemPrompt = `You are an expert customer discovery and market validation assistant. You help entrepreneurs conduct effective customer interviews, analyze insights, and validate business ideas.

Your expertise includes:
- Crafting effective interview questions
- Identifying pain points and customer needs
- Analyzing qualitative research data
- Providing strategic recommendations
- Helping with market validation frameworks

Be concise, actionable, and focused on helping the user make data-driven decisions.`;

  if (context?.projectName) {
    systemPrompt += `\n\nCurrent Project Context:
Project: ${context.projectName}
${context.targetMarket ? `Target Market: ${context.targetMarket}` : ''}
${context.problemStatement ? `Problem Statement: ${context.problemStatement}` : ''}`;
  }

  const prompt = convertToModelMessages([
    { role: 'system', content: systemPrompt } as UIMessage,
    ...messages,
  ]);

  const result = streamText({
    model: 'openai/gpt-5',
    prompt,
    maxOutputTokens: 2000,
    temperature: 0.7,
  });

  return result.toUIMessageStreamResponse();
}
