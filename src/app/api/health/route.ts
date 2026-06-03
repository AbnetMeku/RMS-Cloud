import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "rms-cloud",
    timestamp: new Date().toISOString(),
  });
}
