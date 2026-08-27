import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { StoryForm } from "@/components/admin/StoryForm";
import { isAuthenticated } from "@/lib/admin-auth";
import { getStoryById } from "@/lib/admin-store";

export default async function EditStoryPage({
  params,
  searchParams,
}: PageProps<"/admin/stories/[id]">) {
  if (!(await isAuthenticated())) redirect("/admin/login");

  const { id } = await params;
  const flags = await searchParams;
  const story = await getStoryById(id);
  if (!story) notFound();

  return (
    <AdminShell
      title="Edit story"
      action={
        <Link href="/admin" className="pill">
          ← Dashboard
        </Link>
      }
    >
      {flags.saved && (
        <p className="mb-6 rounded-[var(--radius-card)] border border-forest/60 bg-paper-deep px-4 py-3 text-sm">
          Saved. The site has been refreshed.
        </p>
      )}
      <StoryForm story={story} />
    </AdminShell>
  );
}
