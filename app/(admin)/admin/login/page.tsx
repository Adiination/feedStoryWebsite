import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import {
  adminPasswordTooShort,
  isAdminConfigured,
  isAuthenticated,
} from "@/lib/admin-auth";
import { site } from "@/lib/site";

export default async function LoginPage() {
  if (await isAuthenticated()) redirect("/admin");

  return (
    <div className="grid min-h-screen place-items-center px-5 py-12">
      <div className="w-full max-w-sm">
        <p className="eyebrow text-center">{site.name}</p>
        <h1 className="mt-3 text-center text-3xl">Admin</h1>

        {!isAdminConfigured ? (
          <div className="card mt-8 p-5 text-sm leading-relaxed text-ink-soft">
            <p className="font-semibold text-ink">ADMIN_PASSWORD is not set.</p>
            <p className="mt-2">
              Add it to <code>.env.local</code> and restart the server:
            </p>
            <pre className="mt-3 overflow-x-auto rounded bg-paper-deep p-3 text-xs">
              ADMIN_PASSWORD=a-long-random-passphrase
            </pre>
            <p className="mt-3">
              Until it&rsquo;s set there is no way in — which is the safe
              default, not a bug.
            </p>
          </div>
        ) : (
          <>
            <LoginForm />
            {adminPasswordTooShort && (
              <p className="mt-4 rounded-[var(--radius-card)] border border-gold/40 bg-paper-deep/60 p-3 text-xs leading-relaxed text-ink-soft">
                Your ADMIN_PASSWORD is under 12 characters. This is the only
                lock on the door — use a long passphrase.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
