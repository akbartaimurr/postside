"use client";

import { useActionState } from "react";
import { joinWaitlist } from "@/app/actions";
import ArrowIcon from "@/components/ArrowIcon";

// Email field (h-11) with a slightly smaller submit button docked
// inside it. Messages are absolutely positioned so the hero's height never changes.
export default function EarlyAccessForm() {
  const [state, formAction, pending] = useActionState(joinWaitlist, { status: "idle" });

  if (state.status === "ok") {
    return (
      <p className="flex h-11 items-center squircle bg-black/[0.04] px-4">
        You&apos;re on the list — we&apos;ll be in touch.
      </p>
    );
  }

  return (
    <form
      id="waitlist"
      action={formAction}
      className="relative flex h-11 items-center squircle bg-black/[0.04] py-1 pr-1 pl-4"
    >
      <input
        type="email"
        name="email"
        required
        autoComplete="email"
        placeholder="Enter your email"
        aria-label="Email address"
        className="w-60 bg-transparent outline-none placeholder:text-black/35"
      />
      <button
        type="submit"
        disabled={pending}
        className="flex h-9 cursor-pointer items-center gap-1.5 squircle bg-foreground px-3 font-semibold text-surface hover:bg-neutral-700 disabled:opacity-60"
      >
        {pending ? "Joining…" : "Join the waitlist"}
        <ArrowIcon />
      </button>

      {state.status === "error" && (
        <p role="alert" className="absolute top-full left-4 mt-2 text-sm text-red-600">
          {state.message}
        </p>
      )}
    </form>
  );
}
