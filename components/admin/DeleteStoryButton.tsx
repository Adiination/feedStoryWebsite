"use client";

import { deleteStoryAction } from "@/lib/admin-actions";

/**
 * Deletion is permanent — there's no trash and no undo — so it gets a
 * confirmation step. The action still re-checks auth on the server; this is
 * only here to stop a misclick.
 */
export function DeleteStoryButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  return (
    <form
      action={deleteStoryAction}
      onSubmit={(event) => {
        const ok = window.confirm(
          `Delete “${title}” permanently?\n\nThis cannot be undone.`,
        );
        if (!ok) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="pill hover:border-accent hover:text-accent"
      >
        Delete
      </button>
    </form>
  );
}
