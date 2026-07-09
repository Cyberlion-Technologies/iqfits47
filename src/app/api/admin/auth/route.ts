import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, checkAdminAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { passcode, turnstileToken } = await req.json();
    
    // Verify Turnstile token if configured
    const turnstileSecret = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
    if (turnstileSecret) {
      if (!turnstileToken) {
        return NextResponse.json({ error: "Security check token missing. Please solve the captcha." }, { status: 400 });
      }

      const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${encodeURIComponent(turnstileSecret)}&response=${encodeURIComponent(turnstileToken)}`,
      });

      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        return NextResponse.json({ error: "Security check failed. Please try again." }, { status: 400 });
      }
    }

    const adminPasscode = process.env.ADMIN_PASSCODE ?? "IQFITS-47-ADMIN-2026";

    if (passcode === adminPasscode) {
      const response = NextResponse.json({ success: true, message: "Authentication successful." });
      
      const token = createSessionToken();
      
      // Set secure signed admin session cookie (expires in 7 days)
      response.cookies.set("iqfit_admin_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      return response;
    }

    return NextResponse.json({ error: "Invalid passcode. Please try again." }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const isAuthenticated = checkAdminAuth(req);
  return NextResponse.json({ isAuthenticated });
}

export async function DELETE(req: NextRequest) {
  const response = NextResponse.json({ success: true, message: "Logged out." });
  response.cookies.delete("iqfit_admin_session");
  return response;
}
