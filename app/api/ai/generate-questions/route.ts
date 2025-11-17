import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "Automatic question generation is disabled while we focus on the search experience.",
    },
    { status: 501 },
  );
}
