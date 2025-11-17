import { generateObject } from 'ai';
import { z } from 'zod';
import { createClient } from "@/lib/supabase/server";

const analysisSchema = z.object({
  summary: z.string().describe('Overall summary of key findings'),
  topPainPoints: z.array(z.string()).describe('Top 3-5 pain points identified'),
  validatedHypotheses: z.array(z.string()).describe('Hypotheses that were validated'),
  invalidatedHypotheses: z.array(z.string()).describe('Hypotheses that were not validated'),
  recommendations: z.array(z.string()).describe('Actionable recommendations based on insights'),
  nextSteps: z.array(z.string()).describe('Suggested next steps for research'),
});

export async function POST(req: Request) {
  try {
    const { projectId } = await req.json();

    const supabase = await createClient();
    
    // Fetch project with insights and interviews
    const { data: project } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    const { data: insights } = await supabase
      .from("insights")
      .select("*")
      .eq("project_id", projectId);

    const { data: interviews } = await supabase
      .from("interviews")
      .select(`
        *,
        interview_questions(question, answer)
      `)
      .eq("project_id", projectId)
      .eq("status", "completed");

    if (!project) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }

    const insightsText = insights?.map(i => 
      `[${i.category || 'general'}] [${i.importance}] ${i.insight_text}`
    ).join('\n');

    const interviewData = interviews?.map(i => ({
      title: i.title,
      questions: i.interview_questions || [],
    }));

    const prompt = `Analyze the following customer discovery research data and provide strategic insights:

Project: ${project.name}
Problem Statement: ${project.problem_statement || 'Not specified'}
Solution Hypothesis: ${project.solution_hypothesis || 'Not specified'}

Insights Captured (${insights?.length || 0} total):
${insightsText || 'No insights yet'}

Completed Interviews: ${interviews?.length || 0}

Provide a comprehensive analysis including:
1. A summary of key findings
2. Top pain points identified
3. Which hypotheses were validated or invalidated
4. Actionable recommendations
5. Suggested next steps for research`;

    const { object } = await generateObject({
      model: 'openai/gpt-5',
      schema: analysisSchema,
      prompt,
      maxOutputTokens: 2000,
    });

    return Response.json({ analysis: object });
  } catch (error) {
    console.error("Error analyzing insights:", error);
    return Response.json(
      { error: "Failed to analyze insights" },
      { status: 500 }
    );
  }
}
