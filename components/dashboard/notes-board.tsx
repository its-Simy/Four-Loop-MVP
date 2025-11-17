"use client";

import { useId, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotebookPen, Pin, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Note = {
  id: string;
  title: string;
  body: string;
  category?: string;
  pinned?: boolean;
};

interface NotesBoardProps {
  initialNotes: Note[];
}

export function NotesBoard({ initialNotes }: NotesBoardProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const generateId = useId();

  const addNote = () => {
    if (!title.trim() || !body.trim()) return;
    setNotes((prev) => [
      {
        id: `${generateId}-${Date.now()}`,
        title,
        body,
        category: "Manual note",
        pinned: true,
      },
      ...prev,
    ]);
    setTitle("");
    setBody("");
  };

  const togglePin = (id: string) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, pinned: !note.pinned } : note,
      ),
    );
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  return (
    <Card className="h-full border-white/10 bg-white/5 text-white shadow-lg backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <NotebookPen className="h-5 w-5 text-blue-300" />
          Notes & Updates
        </CardTitle>
        <p className="text-sm text-slate-300">
          Capture meeting summaries, decisions, & quick learnings.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Note title"
            className="mb-3 border-white/20 bg-white/10 text-white placeholder:text-slate-400"
          />
          <Textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Write a quick note about interviews, market updates..."
            className="border-white/20 bg-white/10 text-sm text-white placeholder:text-slate-400"
            rows={3}
          />
          <div className="mt-3 flex justify-end">
            <Button onClick={addNote} className="bg-blue-500 text-white">
              Save note
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[320px] pr-2">
          <div className="space-y-3">
            {notes.length === 0 && (
              <p className="text-sm text-slate-300">
                No notes yet. Capture a quick update above.
              </p>
            )}
            {notes.map((note) => (
              <div
                key={note.id}
                className={cn(
                  "rounded-2xl border border-white/10 p-3 transition",
                  note.pinned
                    ? "bg-blue-500/10 border-blue-400/30"
                    : "bg-white/5",
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-base font-semibold">{note.title}</p>
                    {note.category && (
                      <span className="text-xs text-slate-300">{note.category}</span>
                    )}
                  </div>
                  <div className="flex gap-2 text-slate-400">
                    <button
                      type="button"
                      onClick={() => togglePin(note.id)}
                      className={cn(
                        "rounded-full border border-white/10 p-2 hover:border-blue-400/40 hover:text-blue-200",
                        note.pinned && "text-blue-300",
                      )}
                    >
                      <Pin className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteNote(note.id)}
                      className="rounded-full border border-white/10 p-2 hover:border-red-400/40 hover:text-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-200 whitespace-pre-wrap">
                  {note.body}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
