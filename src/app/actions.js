"use server";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function joinWaitlist(prevState, formData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email)) {
    return { status: "error", message: "Enter a valid email address." };
  }

  // TODO: persist signups (database, Resend audience, Loops, etc.).
  // Until then they only show up in the server logs.
  console.log("[waitlist] new signup:", email);

  return { status: "ok" };
}
