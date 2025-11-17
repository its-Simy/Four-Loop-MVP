import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { InterviewDetails } from "@/components/interviews/interview-details";
import { InterviewQuestions } from "@/components/interviews/interview-questions";
import { InterviewInsights } from "@/components/interviews/interview-insights";

export default async function InterviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/auth/login");
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

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
    <DashboardLayout projects={projects || []}>
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
    </DashboardLayout>
  );
}
