import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { StoryForm } from "@/components/admin/StoryForm";
import { isAuthenticated } from "@/lib/admin-auth";

export default async function NewStoryPage() {
  if (!(await isAuthenticated())) redirect("/admin/login");

  return (
    <AdminShell
      title="New story"
      action={
        <Link href="/admin" className="pill">
          ← Dashboard
        </Link>
      }
    >
      <StoryForm />
    </AdminShell>
  );
}
