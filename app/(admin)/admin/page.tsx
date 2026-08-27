import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { StoryRow } from "@/components/admin/StoryRow";
import { isAuthenticated } from "@/lib/admin-auth";
import { countsByStatus, listAllStories } from "@/lib/admin-store";
import { isDbConfigured } from "@/lib/db";
import { LOCALES, LOCALE_META } from "@/lib/i18n";

export default async function AdminDashboard({
  searchParams,
}: PageProps<"/admin">) {
  if (!(await isAuthenticated())) redirect("/admin/login");

  const flags = await searchParams;

  if (!isDbConfigured) {
    return (
      <AdminShell title="Dashboard">
        <div className="card p-6 text-sm leading-relaxed text-ink-soft">
          <p className="font-semibold text-ink">MONGODB_URI is not set.</p>
          <p className="mt-2">
            Add your connection string to <code>.env.local</code> and restart:
          </p>
          <pre className="mt-3 overflow-x-auto rounded bg-paper-deep p-3 text-xs">
            MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/{"\n"}
            MONGODB_DB=merivasna
          </pre>
        </div>
      </AdminShell>
    );
  }

  let stories;
  let counts;
  try {
    [stories, counts] = await Promise.all([listAllStories(), countsByStatus()]);
  } catch (error) {
    return (
      <AdminShell title="Dashboard">
        <div className="card p-6 text-sm leading-relaxed text-ink-soft">
          <p className="font-semibold text-ink">
            Could not reach the database.
          </p>
          <p className="mt-2 font-mono text-xs break-all">
            {error instanceof Error ? error.message : String(error)}
          </p>
          <p className="mt-3">
            Check MONGODB_URI, and that this machine&rsquo;s IP is allowed in
            Atlas under Network Access.
          </p>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="Dashboard"
      action={
        <Link href="/admin/new" className="btn btn-primary">
          + New story
        </Link>
      }
    >
      {flags.saved && (
        <p className="mb-6 rounded-[var(--radius-card)] border border-forest/60 bg-paper-deep px-4 py-3 text-sm">
          Saved.
        </p>
      )}
      {flags.deleted && (
        <p className="mb-6 rounded-[var(--radius-card)] border border-line bg-paper-deep px-4 py-3 text-sm">
          Story deleted.
        </p>
      )}
      {flags.error && (
        <p className="mb-6 rounded-[var(--radius-card)] border border-accent/50 bg-accent-wash px-4 py-3 text-sm">
          That action failed. Check the server logs.
        </p>
      )}

      <div className="mb-9 grid gap-3 sm:grid-cols-3">
        <Stat label="Published" value={counts.published} />
        <Stat label="Drafts" value={counts.drafts} />
        <Stat label="Total" value={counts.total} />
      </div>

      <div className="mb-9 flex flex-wrap gap-2">
        {LOCALES.map((locale) => {
          const per = counts.perLang[locale] ?? { published: 0, drafts: 0 };
          return (
            <span key={locale} className="pill">
              {LOCALE_META[locale].label}: {per.published} live
              {per.drafts > 0 && ` · ${per.drafts} draft`}
            </span>
          );
        })}
      </div>

      {stories.length === 0 ? (
        <div className="card px-6 py-14 text-center">
          <p className="font-[family-name:var(--font-display)] text-xl text-ink">
            No stories yet
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            Write the first one — it appears on the site the moment you publish.
          </p>
          <Link href="/admin/new" className="btn btn-primary mt-6">
            + New story
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-line-soft">
          {stories.map((story) => (
            <StoryRow key={story.id} story={story} />
          ))}
        </div>
      )}
    </AdminShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-5">
      <p className="eyebrow">{label}</p>
      <p className="mt-1 font-[family-name:var(--font-display)] text-3xl">
        {value}
      </p>
    </div>
  );
}
