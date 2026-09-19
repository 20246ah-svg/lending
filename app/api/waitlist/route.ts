import { NextResponse } from "next/server";
import { appendRecord, readRecords } from "@/lib/storage";

interface WaitlistEntry {
  email: string;
  timestamp: number;
  ip: string;
}

let waitlistCache: WaitlistEntry[] | null = null;

async function getWaitlist(): Promise<WaitlistEntry[]> {
  if (!waitlistCache) {
    waitlistCache = await readRecords<WaitlistEntry>("waitlist");
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

    await appendRecord("waitlist", entry);
    const list = await getWaitlist();
    list.push(entry);

    return NextResponse.json({
      success: true,
      message: "Subscribed to early access waitlist",
      totalSubscribers: list.length,
    });
  } catch {
    return NextResponse.json({ error: "Failed to join waitlist" }, { status: 500 });
  }
}

export async function GET() {
  const list = await getWaitlist();
  return NextResponse.json({
    totalSubscribers: list.length,
    status: "active",
  });
}
