import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "AI analysis is temporarily disabled while we focus on core search functionality.",
    },
    { status: 501 },
  );
}
