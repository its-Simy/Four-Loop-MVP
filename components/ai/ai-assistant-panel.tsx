"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Send, Sparkles, X } from 'lucide-react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { ScrollArea } from "@/components/ui/scroll-area";

interface AIAssistantPanelProps {
  projectContext?: {
    projectName: string;
    targetMarket?: string;
    problemStatement?: string;
  };
}

export function AIAssistantPanel({ projectContext }: AIAssistantPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ 
      api: '/api/ai/chat',
      body: { context: projectContext },
    }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    sendMessage({ text: input });
    setInput("");
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        size="icon"
      >
        <Sparkles className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl flex flex-col z-50">
      <CardHeader className="flex flex-row items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <CardTitle className="text-lg">AI Assistant</CardTitle>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <Sparkles className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">How can I help?</h3>
              <p className="text-sm text-gray-600">
                Ask me about customer discovery, interview questions, or insights analysis.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.parts.map((part, index) => {
                      if (part.type === 'text') {
                        return (
                          <p key={index} className="text-sm whitespace-pre-wrap">
                            {part.text}
                          </p>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              ))}
              {status === 'in_progress' && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="resize-none"
              rows={2}
              disabled={status === 'in_progress'}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              disabled={status === 'in_progress' || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
