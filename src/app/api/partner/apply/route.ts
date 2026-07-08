import { NextRequest, NextResponse } from "next/server";
import { supabaseServer, isSupabaseServerConfigured } from "@/lib/supabase/server";
import { sendPartnerConfirmationEmail, sendAdminPartnerApplicationEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, company, website, partnershipType, message } = body as {
      name: string;
      email: string;
      phone: string;
      company?: string;
      website?: string;
      partnershipType: string;
      message: string;
    };

    // Basic fields validation
    if (!name || !email || !phone || !partnershipType || !message) {
      return NextResponse.json(
        { error: "Required fields (Name, Email, Phone, Partnership Type, Message) are missing." },
        { status: 400 }
      );
    }

    let dbSaved = false;

    // 1. Try to save to Supabase if configured
    if (isSupabaseServerConfigured()) {
      try {
        const { error } = await supabaseServer.from("partners").insert([
          {
            name,
            email,
            phone,
            company: company || null,
            website: website || null,
            partnership_type: partnershipType,
            message,
            status: "pending",
          },
        ]);

        if (!error) {
          dbSaved = true;
        } else {
          console.error("Database insert error details:", error);
        }
      } catch (dbErr) {
        // Fall back gracefully if table is not yet created
        console.error("Supabase table insert failed (fallback active):", dbErr);
      }
    } else {
      console.warn("Supabase server client not configured, bypassing database write.");
    }

    let emailSent = false;
    let smsSent = false;

    // 2. Trigger confirmation email to partner
    if (email) {
      emailSent = await sendPartnerConfirmationEmail({
        name,
        email,
        partnershipType,
      })
        .then((res) => {
          if (!res) {
            console.error("Resend API returned false for partner confirmation email.");
          }
          return res;
        })
        .catch((err) => {
          console.error("Failed to send partner confirmation email:", err);
          return false;
        });
    }

    // 2b. Trigger notification email to admin using Resend
    sendAdminPartnerApplicationEmail({
      name,
      email,
      phone,
      company,
      website,
      partnershipType,
      message,
    }).catch((err) => {
      console.error("Failed to send admin partner application email:", err);
    });

    // 3. Trigger confirmation SMS to partner has been disabled per request.
    // Partner will only receive SMS once approved by the admin in the dashboard.

    if (!dbSaved && !emailSent && !smsSent) {
      return NextResponse.json(
        { error: "Failed to process application. Please try again later or contact us directly." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully.",
      dbSaved,
      emailSent,
      smsSent,
    });
  } catch (err) {
    console.error("Partner application route error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Something went wrong." },
      { status: 500 }
    );
  }
}
