import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { passcode } = await req.json();
    const adminPasscode = process.env.ADMIN_PASSCODE ?? "IQFIT47Admin";

    if (passcode === adminPasscode) {
      const response = NextResponse.json({ success: true, message: "Authentication successful." });
      
      // Set admin session cookie (expires in 7 days)
      response.cookies.set("iqfit_admin_session", "true", {
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
  const cookie = req.cookies.get("iqfit_admin_session");
  const isAuthenticated = cookie?.value === "true";
  return NextResponse.json({ isAuthenticated });
}

export async function DELETE(req: NextRequest) {
  const response = NextResponse.json({ success: true, message: "Logged out." });
  response.cookies.delete("iqfit_admin_session");
  return response;
}
