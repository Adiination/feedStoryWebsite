/**
 * Imports the markdown files in content/stories/<lang>/ into MongoDB.
 *
 *   npm run seed            # import, skipping anything already there
 *   npm run seed -- --force # overwrite existing stories with the file version
 *
 * Stories are matched on (lang, slug), so re-running is safe.
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import matter from "gray-matter";
import { MongoClient } from "mongodb";

const CONTENT_ROOT = path.join(process.cwd(), "content", "stories");
const WORDS_PER_MINUTE = 225;
const LOCALES = ["en", "hi"];

const force = process.argv.includes("--force");
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "merivasna";

if (!uri) {
  console.error(
    "MONGODB_URI is not set.\n" +
      "Add it to .env.local, then run: npm run seed",
  );
  process.exit(1);
}

function stripMarkdown(input) {
  return input
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)]\([^)]*\)/g, "$1")
    .replace(/[*_`>#]/g, "")
    .replace(/^\s*[-–—]{3,}\s*$/gm, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildExcerpt(body, limit = 190) {
  const flat = stripMarkdown(body);
  if (flat.length <= limit) return flat;
  const cut = flat.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : limit).replace(/[,.;:!?—-]$/, "")}…`;
}

function readLocale(lang) {
  const dir = path.join(CONTENT_ROOT, lang);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
    .map((file) => {
      const slug = file.replace(/\.mdx?$/, "");
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const { data, content } = matter(raw);

      if (!data.title) throw new Error(`${lang}/${file} has no title`);
      if (!data.genre) throw new Error(`${lang}/${file} has no genre`);

      const wordCount = stripMarkdown(content).split(/\s+/).filter(Boolean)
        .length;
      const now = new Date();

      return {
        slug,
        lang,
        title: String(data.title),
        author: String(data.author ?? "Anonymous"),
        genre: String(data.genre),
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        date:
          data.date instanceof Date
            ? data.date.toISOString().slice(0, 10)
            : String(data.date ?? "1970-01-01").slice(0, 10),
        excerpt: data.excerpt ? String(data.excerpt) : buildExcerpt(content),
        body: content.trim(),
        featured: Boolean(data.featured),
        published: true,
        translationOf: data.translationOf
          ? String(data.translationOf)
          : undefined,
        wordCount,
        readingMinutes: Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE)),
        createdAt: now,
        updatedAt: now,
      };
    });
}

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });

try {
  await client.connect();
  const stories = client.db(dbName).collection("stories");
  await stories.createIndex({ lang: 1, slug: 1 }, { unique: true });

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const lang of LOCALES) {
    for (const doc of readLocale(lang)) {
      const existing = await stories.findOne({ lang, slug: doc.slug });

      if (existing && !force) {
        skipped += 1;
        continue;
      }

      if (existing) {
        // Keep the original createdAt; everything else comes from the file.
        const fields = { ...doc };
        delete fields.createdAt;
        await stories.updateOne({ _id: existing._id }, { $set: fields });
        updated += 1;
      } else {
        await stories.insertOne(doc);
        inserted += 1;
      }
      console.log(
        `${existing ? "updated" : "added"}  ${lang}/${doc.slug}  (${doc.wordCount} words)`,
      );
    }
  }

  console.log(
    `\nDone. ${inserted} added, ${updated} updated, ${skipped} skipped.` +
      (skipped && !force ? " Re-run with --force to overwrite." : ""),
  );
} catch (error) {
  console.error("\nSeed failed:", error.message);
  process.exitCode = 1;
} finally {
  await client.close();
}
