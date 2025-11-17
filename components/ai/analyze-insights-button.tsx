"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles, Loader2, Lightbulb, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface AnalyzeInsightsButtonProps {
  projectId: string;
}

export function AnalyzeInsightsButton({ projectId }: AnalyzeInsightsButtonProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/ai/analyze-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });

      const { analysis } = await response.json();

      if (!analysis) {
        throw new Error('No analysis generated');
      }

      setAnalysis(analysis);
      setIsOpen(true);
    } catch (error) {
      console.error('Error analyzing insights:', error);
      alert('Failed to analyze insights. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleAnalyze}
        disabled={isAnalyzing}
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            AI Analysis
          </>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI-Powered Insights Analysis
            </DialogTitle>
            <DialogDescription>
              Strategic analysis of your customer discovery research
            </DialogDescription>
          </DialogHeader>

          {analysis && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{analysis.summary}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-orange-600" />
                  Top Pain Points
                </h3>
                <div className="space-y-2">
                  {analysis.topPainPoints.map((point: string, index: number) => (
                    <div key={index} className="flex gap-2 p-3 bg-orange-50 rounded-lg border border-orange-100">
                      <span className="font-semibold text-orange-900">{index + 1}.</span>
                      <p className="text-sm text-orange-900">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Validated
                  </h3>
                  <div className="space-y-2">
                    {analysis.validatedHypotheses.map((item: string, index: number) => (
                      <div key={index} className="p-2 bg-green-50 rounded border border-green-100">
                        <p className="text-sm text-green-900">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    Not Validated
                  </h3>
                  <div className="space-y-2">
                    {analysis.invalidatedHypotheses.map((item: string, index: number) => (
                      <div key={index} className="p-2 bg-red-50 rounded border border-red-100">
                        <p className="text-sm text-red-900">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Recommendations</h3>
                <div className="space-y-2">
                  {analysis.recommendations.map((rec: string, index: number) => (
                    <div key={index} className="flex gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <Badge variant="secondary" className="h-6 bg-blue-200 text-blue-900">
                        {index + 1}
                      </Badge>
                      <p className="text-sm text-blue-900">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-purple-600" />
                  Next Steps
                </h3>
                <ul className="space-y-2">
                  {analysis.nextSteps.map((step: string, index: number) => (
                    <li key={index} className="flex gap-2 text-sm text-gray-700">
                      <span className="text-purple-600">→</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
