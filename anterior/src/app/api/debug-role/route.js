import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId, sessionId, sessionClaims } = auth();

  return NextResponse.json({
    ok: true,
    userId,
    sessionId,
    sessionClaims,
    role: sessionClaims?.publicMetadata?.role || "user",
  });
}
