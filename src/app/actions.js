"use server";

import { Resend } from "resend";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Env (see .env.local):
//   RESEND_API_KEY     required: API key from resend.com/api-keys
//   RESEND_SEGMENT_ID  optional: segment to add waitlist signups to (Contacts → Segments)
//   RESEND_FROM        optional: e.g. "Postside <hello@yourdomain.com>" (a verified domain). When
//                      set, each new signup also gets a short welcome email.
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const alreadyExists = (error) => error?.statusCode === 409 || /already exists/i.test(error?.message ?? "");

export async function joinWaitlist(prevState, formData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email)) {
    return { status: "error", message: "Enter a valid email address." };
  }

  if (!resend) {
    // No key: fine while developing (signups just go to the server log), but never silently
    // drop signups in production
    if (process.env.NODE_ENV === "production") {
      console.error("[waitlist] RESEND_API_KEY is not set; signup not saved:", email);
      return { status: "error", message: "Something went wrong. Please try again later." };
    }
    console.log("[waitlist] (no RESEND_API_KEY) new signup:", email);
    return { status: "ok" };
  }

  const segmentId = process.env.RESEND_SEGMENT_ID;
  const { error } = await resend.contacts.create({
    email,
    unsubscribed: false,
    ...(segmentId && { segments: [{ id: segmentId }] }),
  });

  if (error && !alreadyExists(error)) {
    console.error("[waitlist] Resend contact error:", error);
    return { status: "error", message: "Something went wrong. Please try again." };
  }

  // Welcome email for new signups only (not when someone joins twice)
  if (!error && process.env.RESEND_FROM) {
    const { error: sendError } = await resend.emails.send({
      from: process.env.RESEND_FROM,
      to: email,
      subject: "You're on the Postside waitlist",
      text: [
        "Thanks for joining the Postside waitlist.",
        "",
        "We'll email you as soon as your US cloud phone is ready.",
        "",
        "Postside",
      ].join("\n"),
    });
    // The signup is already saved, so a failed welcome email shouldn't show the user an error
    if (sendError) console.error("[waitlist] Resend welcome email error:", sendError);
  }

  return { status: "ok" };
}
