export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// Server-only: RESEND_API_KEY never reaches the client bundle. Notifies every
// super_admin by email when a new Admin account request comes in, so it
// doesn't rely on someone remembering to check /portal/admin-requests.
export async function POST(request: Request) {
  const { name, email } = await request.json();

  try {
    const { data: superAdmins, error } = await supabase
      .from("portal_users")
      .select("email")
      .eq("role", "super_admin");
    if (error) throw new Error(error.message);

    const recipients = (superAdmins ?? []).map((u) => u.email);
    if (recipients.length === 0) {
      return NextResponse.json({ ok: false, reason: "No super_admin recipients found" });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "TBP Circle Portal <onboarding@resend.dev>",
        to: recipients,
        subject: "New Admin account request — TBP Circle Portal",
        html: `
          <p>A new Admin account has been requested on the TBP Circle Portal.</p>
          <p><strong>Name:</strong> ${name}<br/>
             <strong>Email:</strong> ${email}</p>
          <p><a href="${appUrl}/portal/admin-requests">Review the request</a></p>
        `,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Resend API error: ${res.status} ${body}`);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    // Non-fatal by design - the admin request itself is already saved
    // regardless of whether the notification email succeeds.
    console.error("notify-admin-request failed:", err);
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : "Unknown error" });
  }
}
