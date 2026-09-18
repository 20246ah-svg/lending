import { NextResponse } from "next/server";
import { appendRecord, readRecords } from "@/lib/storage";

interface WaitlistEntry {
  email: string;
  timestamp: number;
  ip: string;
}

let waitlistCache: WaitlistEntry[] | null = null;

function getWaitlist(): WaitlistEntry[] {
  if (!waitlistCache) {
    waitlistCache = readRecords<WaitlistEntry>("waitlist");
  }
  return waitlistCache;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";

    const entry: WaitlistEntry = {
      email: email.trim().toLowerCase(),
      timestamp: Date.now(),
      ip: clientIp,
    };

    appendRecord("waitlist", entry);
    getWaitlist().push(entry);

    return NextResponse.json({
      success: true,
      message: "Subscribed to early access waitlist",
      totalSubscribers: getWaitlist().length,
    });
  } catch {
    return NextResponse.json({ error: "Failed to join waitlist" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    totalSubscribers: getWaitlist().length,
    status: "active",
  });
}
