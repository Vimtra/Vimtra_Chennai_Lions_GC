import "server-only";
import { prisma } from "@/lib/prisma";
import type { Post, PostStatus } from "@prisma/client";

/**
 * News (Post) data layer. Draft/Published/Archived workflow.
 *
 * Public surfaces (/news, /news/[slug]) MUST call the listPublishedPosts
 * and getPublishedPostBySlug helpers so Draft and Archived rows can never
 * leak out. Admin surfaces can list every row via listPosts.
 */

export type { Post, PostStatus };
export { formatPublishedDate } from "./posts-format";

/** Everything, ordered for the admin table. */
export async function listPosts(): Promise<Post[]> {
  return prisma.post.findMany({
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });
}

/** Public — Published only, newest first (with pinned sortOrder first). */
export async function listPublishedPosts(): Promise<Post[]> {
  return prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ sortOrder: "desc" }, { publishedAt: "desc" }],
  });
}

export async function getPost(id: string): Promise<Post | null> {
  return prisma.post.findUnique({ where: { id } });
}

/** Public — resolves only Published posts. Draft/Archived → null. */
export async function getPublishedPostBySlug(slug: string): Promise<Post | null> {
  const post = await prisma.post.findUnique({ where: { slug } });
  return post && post.status === "PUBLISHED" ? post : null;
}

export interface PostInput {
  slug?: string;
  title: string;
  excerpt?: string | null;
  coverImage?: string | null;
  bodyHtml: string;
  bodyJson?: string | null;
  category?: string | null;
  authorName: string;
  status: PostStatus;
  publishedAt?: Date | null;
  sortOrder?: number;
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "post"
  );
}

export async function uniquePostSlug(name: string, ignoreId?: string): Promise<string> {
  const base = slugify(name);
  let candidate = base;
  let n = 2;
  while (true) {
    const existing = await prisma.post.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === ignoreId) return candidate;
    candidate = `${base}-${n++}`;
  }
}

/** Create as DRAFT by default; the editor decides when to Publish. */
export async function createPost(input: PostInput): Promise<Post> {
  const slug = input.slug
    ? await uniquePostSlug(input.slug)
    : await uniquePostSlug(input.title);
  return prisma.post.create({
    data: {
      slug,
      title: input.title,
      excerpt: input.excerpt ?? null,
      coverImage: input.coverImage ?? null,
      bodyHtml: input.bodyHtml,
      bodyJson: input.bodyJson ?? null,
      category: input.category ?? null,
      authorName: input.authorName,
      status: input.status,
      publishedAt:
        input.status === "PUBLISHED"
          ? input.publishedAt ?? new Date()
          : input.publishedAt ?? null,
      sortOrder: input.sortOrder ?? 0,
    },
  });
}

export async function updatePost(id: string, input: Partial<PostInput>): Promise<Post | null> {
  try {
    // Auto-set publishedAt on Draft → Published transition if the caller
    // didn't supply one; leave it alone on other transitions.
    let publishedAt = input.publishedAt;
    if (
      publishedAt === undefined &&
      input.status === "PUBLISHED"
    ) {
      const existing = await prisma.post.findUnique({ where: { id } });
      if (existing && !existing.publishedAt) {
        publishedAt = new Date();
      }
    }
    const nextSlug =
      input.slug !== undefined
        ? await uniquePostSlug(input.slug, id)
        : undefined;
    return await prisma.post.update({
      where: { id },
      data: {
        slug: nextSlug,
        title: input.title,
        excerpt: input.excerpt,
        coverImage: input.coverImage,
        bodyHtml: input.bodyHtml,
        bodyJson: input.bodyJson,
        category: input.category,
        authorName: input.authorName,
        status: input.status,
        publishedAt,
        sortOrder: input.sortOrder,
      },
    });
  } catch {
    return null;
  }
}

export async function deletePost(id: string): Promise<boolean> {
  try {
    await prisma.post.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
