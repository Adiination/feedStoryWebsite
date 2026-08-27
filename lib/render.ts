import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkSmartypants from "remark-smartypants";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";

/**
 * Markdown → HTML for story bodies.
 *
 * Lives in its own module so the public story page and the admin preview run
 * the exact same pipeline. A preview that renders differently from the live
 * page is worse than no preview at all.
 *
 * Note: raw HTML in the source is *not* passed through (no rehype-raw), so a
 * story body can't inject markup or script into a page.
 */
export async function renderStoryMarkdown(body: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkSmartypants)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeStringify)
    .process(body);

  return String(file);
}
