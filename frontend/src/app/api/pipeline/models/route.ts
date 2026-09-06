import { NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

export async function GET() {
  try {
    const response = await fetch(`${FASTAPI_URL}/api/pipeline/models`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Backend returned ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "FastAPI ML Pipeline service unreachable. Ensure backend is running on port 8000.",
        details: error?.message,
      },
      { status: 503 }
    );
  }
}
