import { redirect } from 'next/navigation';
import { InterviewDetails } from "@/components/interviews/interview-details";
import { InterviewQuestions } from "@/components/interviews/interview-questions";
import { InterviewInsights } from "@/components/interviews/interview-insights";
import { getDashboardSession } from "@/lib/dashboard/session";

export default async function InterviewDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const { supabase } = await getDashboardSession();

  const { data: interview } = await supabase
    .from("interviews")
    .select(`
      *,
      leads(id, name, email, phone, company, title),
      projects(name)
    `)
    .eq("id", id)
    .single();

  if (!interview) {
    redirect("/dashboard/interviews");
  }

  const { data: questions } = await supabase
    .from("interview_questions")
    .select("*")
    .eq("interview_id", id)
    .order("question_order", { ascending: true });

  const { data: insights } = await supabase
    .from("insights")
    .select("*")
    .eq("interview_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <InterviewDetails interview={interview} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InterviewQuestions 
          interviewId={id}
          projectId={interview.project_id}
          interviewType={interview.interview_type}
          questions={questions || []} 
        />
        <InterviewInsights 
          interviewId={id}
          projectId={interview.project_id}
          insights={insights || []} 
        />
      </div>
    </div>
  );
}
