"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { format, isSameDay } from "date-fns";

interface Interview {
  id: string;
  title: string;
  scheduled_at: string;
  status: string;
}

interface InterviewsCalendarProps {
  interviews: Interview[];
}

export function InterviewsCalendar({ interviews }: InterviewsCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const interviewDates = interviews
    .filter(i => i.scheduled_at)
    .map(i => new Date(i.scheduled_at));

  const selectedDateInterviews = selectedDate
    ? interviews.filter(i => 
        i.scheduled_at && isSameDay(new Date(i.scheduled_at), selectedDate)
      )
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          modifiers={{
            hasInterview: interviewDates,
          }}
          modifiersStyles={{
            hasInterview: {
              fontWeight: 'bold',
              textDecoration: 'underline',
            },
          }}
          className="rounded-md border"
        />

        {selectedDate && (
          <div className="mt-4">
            <h4 className="font-semibold text-sm text-gray-900 mb-2">
              {format(selectedDate, "MMMM d, yyyy")}
            </h4>
            {selectedDateInterviews.length === 0 ? (
              <p className="text-sm text-gray-500">No interviews scheduled</p>
            ) : (
              <div className="space-y-2">
                {selectedDateInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="p-2 rounded bg-gray-50 border border-gray-200"
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {interview.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(interview.scheduled_at), "h:mm a")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
