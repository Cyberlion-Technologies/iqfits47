import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, checkAdminAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { passcode } = await req.json();
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
