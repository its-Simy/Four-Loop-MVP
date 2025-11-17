"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface Insight {
  category: string | null;
}

interface Interview {
  status: string;
}

interface ValidationScorecardProps {
  insights: Insight[];
  interviews: Interview[];
}

export function ValidationScorecard({ insights, interviews }: ValidationScorecardProps) {
  const completedInterviews = interviews.filter(i => i.status === 'completed').length;
  const totalInterviews = interviews.length;
  
  const validationInsights = insights.filter(i => i.category === 'validation').length;
  const painPointInsights = insights.filter(i => i.category === 'pain_point').length;
  const needInsights = insights.filter(i => i.category === 'need').length;
  
  // Calculate validation score (0-100)
  const interviewScore = Math.min((completedInterviews / 10) * 100, 100);
  const insightScore = Math.min((insights.length / 20) * 100, 100);
  const validationScore = Math.round((interviewScore + insightScore) / 2);

  const getScoreStatus = (score: number) => {
    if (score >= 70) return { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/20 border-green-400/30', label: 'Strong' };
    if (score >= 40) return { icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-400/30', label: 'Moderate' };
    return { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20 border-red-400/30', label: 'Needs Work' };
  };

  const status = getScoreStatus(validationScore);
  const StatusIcon = status.icon;

  return (
    <Card className="bg-gray-800/50 border-white/20">
      <CardHeader>
        <CardTitle className="text-white">Validation Scorecard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">Overall Validation</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-4xl font-bold text-white">{validationScore}%</p>
              <div className={`flex items-center gap-1 px-2 py-1 rounded border ${status.bg}`}>
                <StatusIcon className={`h-4 w-4 ${status.color}`} />
                <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Interview Progress</span>
              <span className="font-medium text-white">{completedInterviews} / 10 completed</span>
            </div>
            <Progress value={interviewScore} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Insights Collected</span>
              <span className="font-medium text-white">{insights.length} / 20 target</span>
            </div>
            <Progress value={insightScore} className="h-2" />
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 space-y-3">
          <p className="text-sm font-medium text-gray-300">Key Metrics</p>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-purple-500/20 border border-purple-400/30 rounded-lg">
              <p className="text-2xl font-bold text-purple-300">{validationInsights}</p>
              <p className="text-xs text-purple-400 mt-1">Validations</p>
            </div>
            <div className="text-center p-3 bg-orange-500/20 border border-orange-400/30 rounded-lg">
              <p className="text-2xl font-bold text-orange-300">{painPointInsights}</p>
              <p className="text-xs text-orange-400 mt-1">Pain Points</p>
            </div>
            <div className="text-center p-3 bg-blue-500/20 border border-blue-400/30 rounded-lg">
              <p className="text-2xl font-bold text-blue-300">{needInsights}</p>
              <p className="text-xs text-blue-400 mt-1">Needs</p>
            </div>
          </div>
        </div>

        {validationScore < 70 && (
          <div className="p-3 bg-blue-500/10 border border-blue-400/30 rounded-lg">
            <p className="text-sm text-blue-200">
              <strong>Tip:</strong> Conduct more interviews and capture detailed insights to strengthen your validation score.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
