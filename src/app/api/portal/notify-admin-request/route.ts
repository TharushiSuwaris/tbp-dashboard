export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

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
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);

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
          <div style="font-family: Arial, Helvetica, sans-serif; color: #0C1929; max-width: 480px;">
            <p style="font-size: 15px; line-height: 1.6;">
              <strong>${safeName}</strong> (${safeEmail}) has requested an Admin account on the
              TBP Circle Portal.
            </p>
            <p style="font-size: 15px; line-height: 1.6;">
              Log in to review the request and approve or decline it.
            </p>
            <p style="margin: 24px 0;">
              <a href="${appUrl}/portal/login"
                 style="background: #3A9FC0; color: #0C1929; text-decoration: none; font-weight: bold;
                        padding: 10px 20px; border-radius: 6px; display: inline-block; font-size: 14px;">
                Log In to TBP Circle Portal
              </a>
            </p>
            <p style="font-size: 12px; color: #4A5C70;">
              Once logged in, go to <strong>Admin Account Requests</strong> in the sidebar to approve or
              decline this request.
            </p>
          </div>
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
