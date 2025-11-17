import { generateObject } from 'ai';
import { z } from 'zod';
import { createClient } from "@/lib/supabase/server";

const questionsSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().describe('An interview question'),
      category: z.enum(['problem_discovery', 'pain_points', 'current_solutions', 'desired_outcomes', 'validation']),
      rationale: z.string().describe('Why this question is valuable'),
    })
  ),
});

export async function POST(req: Request) {
  try {
    const { projectId, interviewType } = await req.json();

    const supabase = await createClient();
    
    // Fetch project details
    const { data: project } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (!project) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }

    const prompt = `Generate 8-10 customer discovery interview questions for the following project:

Project: ${project.name}
Target Market: ${project.target_market || 'Not specified'}
Problem Statement: ${project.problem_statement || 'Not specified'}
Solution Hypothesis: ${project.solution_hypothesis || 'Not specified'}
Interview Type: ${interviewType || 'discovery'}

Generate questions that will help validate the problem, understand customer pain points, and test the solution hypothesis. Focus on open-ended questions that encourage detailed responses.`;

    const { object } = await generateObject({
      model: 'openai/gpt-5',
      schema: questionsSchema,
      prompt,
      maxOutputTokens: 2000,
    });

    return Response.json({ questions: object.questions });
  } catch (error) {
    console.error("Error generating questions:", error);
    return Response.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    );
  }
}
