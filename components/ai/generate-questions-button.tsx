"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";

interface GenerateQuestionsButtonProps {
  interviewId: string;
  projectId: string;
  interviewType: string;
}

export function GenerateQuestionsButton({ 
  interviewId, 
  projectId, 
  interviewType 
}: GenerateQuestionsButtonProps) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      // Call AI API to generate questions
      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, interviewType }),
      });

      const { questions } = await response.json();

      if (!questions) {
        throw new Error('No questions generated');
      }

      // Save questions to database
      const supabase = createClient();
      const questionsToInsert = questions.map((q: any, index: number) => ({
        interview_id: interviewId,
        question: q.question,
        question_order: index + 1,
      }));

      await supabase.from("interview_questions").insert(questionsToInsert);

      router.refresh();
    } catch (error) {
      console.error('Error generating questions:', error);
      alert('Failed to generate questions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleGenerate}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4 mr-2" />
          Generate with AI
        </>
      )}
    </Button>
  );
}
