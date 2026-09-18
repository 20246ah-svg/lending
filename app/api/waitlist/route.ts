import { NextResponse } from "next/server";

// Server-side waitlist store
const waitlistSubscribers: Array<{ email: string; timestamp: number; ip: string }> = [];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";

    waitlistSubscribers.push({
      email: email.trim().toLowerCase(),
      timestamp: Date.now(),
      ip: clientIp,
    });

    return NextResponse.json({
      success: true,
      message: "Subscribed to early access waitlist",
      totalSubscribers: waitlistSubscribers.length,
    });
  } catch {
    return NextResponse.json({ error: "Failed to join waitlist" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    totalSubscribers: waitlistSubscribers.length,
    status: "active",
  });
}
