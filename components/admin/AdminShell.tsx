import Link from "next/link";
import { logoutAction } from "@/lib/admin-actions";
import { site } from "@/lib/site";
import { Ornament } from "../Ornament";

/** Chrome shared by every signed-in admin page. */
export function AdminShell({
  children,
  title,
  action,
}: {
  children: React.ReactNode;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
        <div className="shell flex h-16 items-center justify-between gap-4">
          <Link
            href="/admin"
            className="flex items-baseline gap-1.5 font-[family-name:var(--font-display)] text-lg font-semibold whitespace-nowrap"
          >
            {site.name}
            <Ornament className="size-2.5 text-accent" />
            <span className="ml-1 text-xs font-normal tracking-widest text-muted uppercase">
              admin
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/en" target="_blank" className="pill">
              View site ↗
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="pill">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="shell py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl sm:text-4xl">{title}</h1>
          {action}
        </div>
        {children}
      </div>
    </div>
  );
}
