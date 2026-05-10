import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    service: "DrivePortal API",
    timestamp: new Date().toISOString()
  });
}
