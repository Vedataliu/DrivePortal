import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {

  const userId = request.headers.get("x-user-id");
  const role = request.headers.get("x-user-role");
  const email = request.headers.get("x-user-email");

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({
    user: { id: userId, email, role }
  });
}
