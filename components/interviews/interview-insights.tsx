"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Lightbulb } from 'lucide-react';
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";

interface Insight {
  id: string;
  insight_text: string;
  category: string | null;
  importance: string;
  created_at: string;
}

interface InterviewInsightsProps {
  interviewId: string;
  projectId: string;
  insights: Insight[];
}

export function InterviewInsights({ interviewId, projectId, insights }: InterviewInsightsProps) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [newInsight, setNewInsight] = useState({
    text: "",
    category: "",
    importance: "medium",
  });

  const handleAddInsight = async () => {
    if (!newInsight.text.trim()) return;

    try {
      const supabase = createClient();
      await supabase.from("insights").insert([
        {
          project_id: projectId,
          interview_id: interviewId,
          insight_text: newInsight.text,
          category: newInsight.category || null,
          importance: newInsight.importance,
        },
      ]);

      setNewInsight({ text: "", category: "", importance: "medium" });
      setIsAdding(false);
      router.refresh();
    } catch (error) {
      console.error("Error adding insight:", error);
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Key Insights</CardTitle>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Insight
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdding && (
          <div className="p-4 border border-blue-200 rounded-lg bg-blue-50 space-y-3">
            <Textarea
              placeholder="Describe the insight..."
              value={newInsight.text}
              onChange={(e) => setNewInsight({ ...newInsight, text: e.target.value })}
              rows={3}
            />
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={newInsight.category}
                onValueChange={(value) => setNewInsight({ ...newInsight, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pain_point">Pain Point</SelectItem>
                  <SelectItem value="need">Need</SelectItem>
                  <SelectItem value="behavior">Behavior</SelectItem>
                  <SelectItem value="feature_request">Feature Request</SelectItem>
                  <SelectItem value="objection">Objection</SelectItem>
                  <SelectItem value="validation">Validation</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={newInsight.importance}
                onValueChange={(value) => setNewInsight({ ...newInsight, importance: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsAdding(false);
                  setNewInsight({ text: "", category: "", importance: "medium" });
                }}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleAddInsight}>
                Add Insight
              </Button>
            </div>
          </div>
        )}

        {insights.length === 0 && !isAdding ? (
          <div className="text-center py-8">
            <Lightbulb className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No insights captured yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight) => (
              <div key={insight.id} className="p-3 border rounded-lg hover:border-blue-300 transition-colors">
                <div className="flex items-start gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <p className="flex-1 text-sm text-gray-900">{insight.insight_text}</p>
                </div>
                <div className="flex items-center gap-2 ml-6">
                  {insight.category && (
                    <Badge variant="secondary" className="text-xs">
                      {insight.category.replace('_', ' ')}
                    </Badge>
                  )}
                  <Badge className={`text-xs ${getImportanceColor(insight.importance)}`} variant="secondary">
                    {insight.importance}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
