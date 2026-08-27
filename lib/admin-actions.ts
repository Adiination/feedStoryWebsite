"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  clearAttempts,
  createSession,
  destroySession,
  isAdminConfigured,
  isAuthenticated,
  isRateLimited,
  registerFailedAttempt,
  verifyPassword,
} from "./admin-auth";
import {
  clearOtherFeatured,
  createStory,
  deleteStory,
  DuplicateSlugError,
  updateStory,
  type StoryInput,
} from "./admin-store";
import { GENRES } from "./genres";
import { isLang, type Lang } from "./i18n";
import { slugify } from "./stories";

export type ActionState = { error?: string; ok?: string } | undefined;

/* ---------------------------------- auth ---------------------------------- */

async function clientKey(): Promise<string> {
  const store = await headers();
  return (
    store.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    store.get("x-real-ip") ||
    "local"
  );
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isAdminConfigured) {
    return { error: "ADMIN_PASSWORD is not set on the server." };
  }

  const key = await clientKey();
  if (isRateLimited(key)) {
    return { error: "Too many attempts. Try again in 10 minutes." };
  }

  const candidate = String(formData.get("password") ?? "");

  if (!verifyPassword(candidate)) {
    registerFailedAttempt(key);
    // Same message either way — don't confirm whether a guess was close.
    return { error: "Incorrect password." };
  }

  clearAttempts(key);
  await createSession();
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

/** Every mutating action calls this first. */
async function requireAuth(): Promise<void> {
  if (!(await isAuthenticated())) redirect("/admin/login");
}

/* --------------------------------- stories -------------------------------- */

/**
 * Publishing changes what the public pages render, and those pages are cached
 * as static HTML. Invalidating the whole tree is heavier than targeting single
 * paths, but this fires a few times a day at most and it cannot be got wrong —
 * a stale feed after publishing is a much worse bug than a rebuild.
 */
function revalidateSite(): void {
  revalidatePath("/", "layout");
}

function parseForm(formData: FormData): StoryInput {
  const langRaw = String(formData.get("lang") ?? "en");
  const lang: Lang = isLang(langRaw) ? langRaw : "en";

  const title = String(formData.get("title") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();

  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 12);

  const today = new Date().toISOString().slice(0, 10);
  const dateRaw = String(formData.get("date") ?? "").trim();

  return {
    lang,
    title,
    slug: slugify(slugRaw || title),
    author: String(formData.get("author") ?? "").trim() || "Anonymous",
    genre: String(formData.get("genre") ?? "").trim(),
    tags,
    date: /^\d{4}-\d{2}-\d{2}$/.test(dateRaw) ? dateRaw : today,
    excerpt: String(formData.get("excerpt") ?? "").trim(),
    body: String(formData.get("body") ?? ""),
    featured: formData.get("featured") === "on",
    published: formData.get("published") === "on",
    translationOf: slugify(String(formData.get("translationOf") ?? "").trim()),
  };
}

function validate(input: StoryInput): string | null {
  if (!input.title) return "Title is required.";
  if (!input.slug) {
    return "Could not build a URL slug from that title — add one manually.";
  }
  if (!GENRES.some((genre) => genre.slug === input.genre)) {
    return "Pick a category.";
  }
  if (input.body.trim().length < 40) {
    return "The story body is empty (or nearly).";
  }
  return null;
}

export async function saveStoryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAuth();

  const id = String(formData.get("id") ?? "").trim();
  const input = parseForm(formData);

  const problem = validate(input);
  if (problem) return { error: problem };

  let storyId = id;

  try {
    if (id) {
      await updateStory(id, input);
    } else {
      storyId = await createStory(input);
    }
  } catch (error) {
    if (error instanceof DuplicateSlugError) return { error: error.message };
    console.error("[admin] save failed:", error);
    return { error: "Could not save. Check the server logs." };
  }

  // Only one hero per language.
  if (input.featured) {
    try {
      await clearOtherFeatured(input.lang, storyId);
    } catch (error) {
      console.error("[admin] could not clear other featured:", error);
    }
  }

  revalidateSite();
  revalidatePath("/admin");
  redirect(`/admin/stories/${storyId}?saved=1`);
}

export async function deleteStoryAction(formData: FormData): Promise<void> {
  await requireAuth();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin");

  try {
    await deleteStory(id);
  } catch (error) {
    console.error("[admin] delete failed:", error);
    redirect("/admin?error=delete");
  }

  revalidateSite();
  revalidatePath("/admin");
  redirect("/admin?deleted=1");
}

/** Publish / unpublish straight from the dashboard list. */
export async function togglePublishedAction(
  formData: FormData,
): Promise<void> {
  await requireAuth();

  const id = String(formData.get("id") ?? "").trim();
  const next = formData.get("next") === "1";
  if (!id) redirect("/admin");

  const { getStoryById } = await import("./admin-store");
  const existing = await getStoryById(id);
  if (!existing) redirect("/admin");

  try {
    await updateStory(id, {
      lang: existing.lang,
      title: existing.title,
      slug: existing.slug,
      author: existing.author,
      genre: existing.genre,
      tags: existing.tags,
      date: existing.date,
      excerpt: existing.excerpt,
      body: existing.body,
      featured: existing.featured,
      published: next,
      translationOf: existing.translationOf ?? "",
    });
  } catch (error) {
    console.error("[admin] publish toggle failed:", error);
    redirect("/admin?error=publish");
  }

  revalidateSite();
  revalidatePath("/admin");
  redirect("/admin");
}
