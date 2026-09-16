import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createSessionToken, setSessionCookie, verifyPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "ইমেইল ও পাসওয়ার্ড আবশ্যক" }, { status: 400 });
    }

    const [user] = await db.select().from(users).where(eq(users.email, String(email).toLowerCase())).limit(1);

    if (!user) {
      return NextResponse.json({ error: "ভুল ইমেইল অথবা পাসওয়ার্ড" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "ভুল ইমেইল অথবা পাসওয়ার্ড" }, { status: 401 });
    }

    const token = await createSessionToken({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
    await setSessionCookie(token);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "লগইন করতে সমস্যা হয়েছে" }, { status: 500 });
  }
}
