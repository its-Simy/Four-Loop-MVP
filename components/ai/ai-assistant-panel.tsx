"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface AIAssistantPanelProps {
  projectContext?: {
    projectName: string;
    targetMarket?: string;
    problemStatement?: string;
  };
}

export function AIAssistantPanel({ projectContext }: AIAssistantPanelProps) {
  const contextLabel = projectContext?.projectName
    ? ` for ${projectContext.projectName}`
    : "";

  return (
    <Card className="mt-8 border-dashed border-white/20 bg-gray-900/60 text-white">
      <CardHeader className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-500">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <CardTitle>AI Assistant (coming soon)</CardTitle>
          <p className="text-sm text-slate-300">
            Automated recommendations will appear here once AI features are
            enabled{contextLabel}.
          </p>
        </div>
      </CardHeader>
      <CardContent className="text-sm text-slate-200">
        For now, use the global search at the top of the dashboard to find
        interviews, leads, and insights. We&apos;re focusing on that experience
        before reintroducing chat-based workflows.
      </CardContent>
    </Card>
  );
}
