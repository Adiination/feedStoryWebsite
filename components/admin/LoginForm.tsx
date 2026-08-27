"use client";

import { useActionState } from "react";
import { loginAction, type ActionState } from "@/lib/admin-actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    loginAction,
    undefined,
  );

  return (
    <form action={action} className="mt-8 space-y-4">
      <div>
        <label htmlFor="password" className="eyebrow mb-2 block">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          autoFocus
          required
          className="w-full rounded-[var(--radius-card)] border border-line bg-card px-4 py-3 text-ink focus:border-accent focus:outline-none"
        />
      </div>

      {state?.error && (
        <p
          role="alert"
          className="rounded-[var(--radius-card)] border border-accent/50 bg-accent-wash px-4 py-3 text-sm text-ink"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary w-full py-3 disabled:opacity-60"
      >
        {pending ? "Checking…" : "Sign in"}
      </button>
    </form>
  );
}
