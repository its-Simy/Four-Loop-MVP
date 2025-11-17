"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Archive, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

type EmailCard = {
  id: string;
  leadName: string;
  company?: string | null;
  persona?: string | null;
  subject: string;
  preview: string;
  priority: number;
};

interface EmailQueueProps {
  initialQueue: EmailCard[];
}

export function EmailQueue({ initialQueue }: EmailQueueProps) {
  const [queue, setQueue] = useState<EmailCard[]>(initialQueue);
  const visibleCards = useMemo(() => queue.slice(0, 4), [queue]);

  const handleAction = (id: string) => {
    setQueue((prev) => {
      const remaining = prev.filter((card) => card.id !== id);
      return remaining;
    });
  };

  return (
    <Card className="h-full border-white/10 bg-white/5 text-white shadow-lg backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Mail className="h-5 w-5 text-emerald-300" />
          Email Queue
        </CardTitle>
        <p className="text-sm text-slate-300">
          Top outreach drafts ready to send or archive.
        </p>
      </CardHeader>
      <CardContent>
        {visibleCards.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center text-slate-300">
            <Mail className="h-10 w-10 text-slate-500" />
            <p className="mt-3 text-sm">You&apos;ve processed all queued emails.</p>
          </div>
        ) : (
          <ScrollArea className="h-[360px] pr-3">
            <div className="space-y-4">
              {visibleCards.map((card) => (
                <div
                  key={card.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-base font-semibold">
                        {card.subject}
                      </h3>
                      <p className="text-sm text-slate-300">
                        {card.leadName} · {card.company || "Unknown org"}
                      </p>
                    </div>
                    <Badge className="self-start rounded-full bg-emerald-500/10 text-xs text-emerald-200">
                      Priority {card.priority}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm text-slate-200 whitespace-pre-wrap">
                    {card.preview}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button
                      className="flex-1 bg-emerald-500 text-white"
                      onClick={() => handleAction(card.id)}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Send
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border border-white/20 text-slate-100"
                      onClick={() => handleAction(card.id)}
                    >
                      <Archive className="mr-2 h-4 w-4" />
                      Archive
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
