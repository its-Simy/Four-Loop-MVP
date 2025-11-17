"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Plus, Check, X } from 'lucide-react';
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import { GenerateQuestionsButton } from "@/components/ai/generate-questions-button";

interface Question {
  id: string;
  question: string;
  answer: string | null;
  question_order: number;
}

interface InterviewQuestionsProps {
  interviewId: string;
  projectId: string;
  interviewType: string;
  questions: Question[];
}

export function InterviewQuestions({ interviewId, projectId, interviewType, questions }: InterviewQuestionsProps) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingAnswer, setEditingAnswer] = useState("");

  const handleAddQuestion = async () => {
    if (!newQuestion.trim()) return;

    try {
      const supabase = createClient();
      await supabase.from("interview_questions").insert([
        {
          interview_id: interviewId,
          question: newQuestion,
          question_order: questions.length + 1,
        },
      ]);

      setNewQuestion("");
      setIsAdding(false);
      router.refresh();
    } catch (error) {
      console.error("Error adding question:", error);
    }
  };

  const handleSaveAnswer = async (questionId: string) => {
    try {
      const supabase = createClient();
      await supabase
        .from("interview_questions")
        .update({ answer: editingAnswer })
        .eq("id", questionId);

      setEditingId(null);
      setEditingAnswer("");
      router.refresh();
    } catch (error) {
      console.error("Error saving answer:", error);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Interview Questions</CardTitle>
        <div className="flex gap-2">
          {questions.length === 0 && (
            <GenerateQuestionsButton
              interviewId={interviewId}
              projectId={projectId}
              interviewType={interviewType}
            />
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdding && (
          <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
            <Input
              placeholder="Enter your question..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="mb-2"
            />
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsAdding(false);
                  setNewQuestion("");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button size="sm" onClick={handleAddQuestion}>
                <Check className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {questions.length === 0 && !isAdding ? (
          <p className="text-center text-gray-500 py-8">
            No questions added yet. Add your first question or generate them with AI!
          </p>
        ) : (
          <div className="space-y-4">
            {questions.map((q, index) => (
              <div key={q.id} className="p-4 border rounded-lg">
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-sm font-semibold text-gray-500">Q{index + 1}.</span>
                  <p className="flex-1 text-sm font-medium text-gray-900">{q.question}</p>
                </div>
                {editingId === q.id ? (
                  <div className="mt-2">
                    <Textarea
                      placeholder="Enter answer..."
                      value={editingAnswer}
                      onChange={(e) => setEditingAnswer(e.target.value)}
                      rows={3}
                      className="mb-2"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingId(null);
                          setEditingAnswer("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => handleSaveAnswer(q.id)}>
                        Save Answer
                      </Button>
                    </div>
                  </div>
                ) : q.answer ? (
                  <div
                    className="mt-2 p-3 bg-gray-50 rounded text-sm text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      setEditingId(q.id);
                      setEditingAnswer(q.answer || "");
                    }}
                  >
                    {q.answer}
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => setEditingId(q.id)}
                  >
                    Add Answer
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
