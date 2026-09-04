"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import type { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Post, PostStatus } from "@prisma/client";
import Link from "next/link";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo2,
  Redo2,
  Code2,
  Minus,
  Trash2,
} from "lucide-react";
import { updatePostAction, deletePostAction } from "@/app/admin/news/actions";

// A rich-text editor bound to a single Post row. TipTap loads only on this
// route (client component); public /news and /news/[slug] stay editor-free.
//
// Every input lives inside a single main form so the Save action submits
// title, slug, body, cover, author, status, publish date, sort order in
// one go. Delete lives in a sibling form (HTML disallows nested forms).

const TOOLBAR_BTN =
  "inline-flex items-center justify-center w-8 h-8 rounded-[8px] border border-black/[0.10] bg-white text-ink text-[13px] hover:border-crimson-600 hover:text-crimson-600 disabled:opacity-40";

export default function PostEditor({ post }: { post: Post }) {
  const initialJson = useMemo(() => {
    if (!post.bodyJson) return undefined;
    try {
      return JSON.parse(post.bodyJson);
    } catch {
      return undefined;
    }
  }, [post.bodyJson]);

  const editor = useEditor({
    extensions: [StarterKit],
    // Avoid an SSR/CSR mismatch — hydrate on the client only.
    immediatelyRender: false,
    content: initialJson ?? post.bodyHtml ?? "<p></p>",
    editorProps: {
      attributes: {
        class:
          "min-h-[420px] bg-white border border-black/[0.12] rounded-[14px] p-5 focus:outline-none focus:border-crimson-600 focus:ring-4 focus:ring-crimson-600/10 " +
          "font-manrope text-[15.5px] leading-[1.7] text-ink " +
          "[&_p]:my-[0.7em] " +
          "[&_h2]:font-sora [&_h2]:font-extrabold [&_h2]:text-[24px] [&_h2]:tracking-[-0.015em] [&_h2]:mt-6 [&_h2]:mb-2 " +
          "[&_h3]:font-sora [&_h3]:font-bold [&_h3]:text-[19px] [&_h3]:mt-4 [&_h3]:mb-1 " +
          "[&_a]:text-crimson-600 [&_a]:underline " +
          "[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 " +
          "[&_blockquote]:border-l-4 [&_blockquote]:border-crimson-600 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted " +
          "[&_code]:bg-cream-50 [&_code]:px-[6px] [&_code]:py-[2px] [&_code]:rounded-[6px] " +
          "[&_pre]:bg-ink [&_pre]:text-white [&_pre]:p-3 [&_pre]:rounded-[10px]",
      },
    },
  });

  const jsonRef = useRef<HTMLInputElement>(null);
  const htmlRef = useRef<HTMLInputElement>(null);

  // Sync hidden inputs on every editor update so the form submits the
  // latest content without needing an explicit "sync" button.
  useEffect(() => {
    if (!editor) return;
    const sync = () => {
      if (jsonRef.current) jsonRef.current.value = JSON.stringify(editor.getJSON());
      if (htmlRef.current) htmlRef.current.value = editor.getHTML();
    };
    sync();
    editor.on("update", sync);
    return () => {
      editor.off("update", sync);
    };
  }, [editor]);

  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [status, setStatus] = useState<PostStatus>(post.status);

  const toDateInputLocal = (d: Date | null): string => {
    if (!d) return "";
    const dt = new Date(d);
    const pad = (n: number) => String(n).padStart(2, "0");
    return (
      `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}` +
      `T${pad(dt.getHours())}:${pad(dt.getMinutes())}`
    );
  };

  return (
    <div>
      <form action={updatePostAction} className="grid gap-6 lg:grid-cols-[1fr_320px] items-start">
        <input type="hidden" name="id" value={post.id} />
        <input type="hidden" name="bodyJson" ref={jsonRef} />
        <input type="hidden" name="bodyHtml" ref={htmlRef} />
        {/* Radios update React state; a hidden input carries the value to submit. */}
        <input type="hidden" name="status" value={status} />

        {/* -------- LEFT: editorial fields + body -------- */}
        <div className="grid gap-4">
          <div className="field">
            <label htmlFor="post-title">Title</label>
            <input
              id="post-title"
              name="title"
              value={title}
              onChange={(e) => {
                const v = e.target.value;
                setTitle(v);
                if (!slugManuallyEdited) {
                  setSlug(
                    v
                      .toLowerCase()
                      .trim()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-+|-+$/g, "")
                  );
                }
              }}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_220px] gap-4">
            <div className="field">
              <label htmlFor="post-slug">Slug</label>
              <input
                id="post-slug"
                name="slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugManuallyEdited(true);
                }}
              />
            </div>
            <div className="field">
              <label htmlFor="post-category">Category</label>
              <input
                id="post-category"
                name="category"
                defaultValue={post.category ?? ""}
                placeholder="Feature · Notebook · …"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="post-excerpt">
              Excerpt (1–2 lines shown on /news and in metadata)
            </label>
            <textarea
              id="post-excerpt"
              name="excerpt"
              defaultValue={post.excerpt ?? ""}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="field">
              <label htmlFor="post-cover">
                Cover image (path under /public, optional)
              </label>
              <input
                id="post-cover"
                name="coverImage"
                defaultValue={post.coverImage ?? ""}
                placeholder="/news/some-photo.jpg"
              />
            </div>
            <div className="field">
              <label htmlFor="post-author">Author</label>
              <input
                id="post-author"
                name="authorName"
                defaultValue={post.authorName}
              />
            </div>
          </div>

          <div>
            <label className="block font-manrope font-semibold text-[13px] text-ink mb-2">
              Body
            </label>
            <EditorToolbar editor={editor} />
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* -------- RIGHT: publish sidebar -------- */}
        <aside className="grid gap-4 self-start lg:sticky lg:top-24">
          <div className="admin-card">
            <div className="font-manrope font-bold text-[10.5px] tracking-[0.28em] text-crimson-600 uppercase">
              Publish
            </div>
            <div className="mt-3 grid gap-3">
              <StatusRadio value="DRAFT" current={status} setStatus={setStatus} label="Draft" />
              <StatusRadio value="PUBLISHED" current={status} setStatus={setStatus} label="Published" />
              <StatusRadio value="ARCHIVED" current={status} setStatus={setStatus} label="Archived" />
            </div>

            <div className="field mt-5">
              <label htmlFor="post-publishedAt">Publish date (optional)</label>
              <input
                id="post-publishedAt"
                type="datetime-local"
                name="publishedAt"
                defaultValue={toDateInputLocal(post.publishedAt)}
              />
            </div>

            <div className="field">
              <label htmlFor="post-sort">Sort order (higher pins to top)</label>
              <input
                id="post-sort"
                type="number"
                name="sortOrder"
                defaultValue={post.sortOrder}
              />
            </div>

            <p className="mt-1 font-manrope text-[12px] text-muted leading-[1.55] mb-0">
              On <strong>Draft → Published</strong>, publish date defaults to
              now if left blank. Only <strong>Published</strong> posts render
              on the public site.
            </p>

            <div className="mt-5 flex flex-col gap-2">
              <button type="submit" className="btn-dark press w-full justify-center">
                Save changes
              </button>
              <Link href="/admin/news" className="btn-ghost justify-center">
                Cancel
              </Link>
            </div>

            <div className="mt-4 font-manrope text-[11.5px] text-muted">
              Last updated {formatShort(post.updatedAt)}
            </div>
          </div>
        </aside>
      </form>

      {/* Sibling delete form — HTML disallows nested <form>. */}
      <form
        action={deletePostAction}
        className="admin-card mt-6 max-w-[360px]"
        style={{ background: "#fff" }}
      >
        <input type="hidden" name="id" value={post.id} />
        <div className="font-manrope font-bold text-[10.5px] tracking-[0.28em] text-crimson-600 uppercase">
          Danger Zone
        </div>
        <div className="mt-2 font-manrope text-[12.5px] text-muted">
          Delete permanently. Archived is usually the safer choice.
        </div>
        <button type="submit" className="btn-ghost btn-danger mt-3">
          <Trash2 className="w-[13px] h-[13px]" /> Delete post
        </button>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------

function StatusRadio({
  value,
  current,
  setStatus,
  label,
}: {
  value: PostStatus;
  current: PostStatus;
  setStatus: (s: PostStatus) => void;
  label: string;
}) {
  const active = current === value;
  return (
    <label
      className={`flex items-center gap-3 cursor-pointer rounded-[10px] px-3 py-[10px] border transition-colors ${
        active
          ? "bg-white border-crimson-600 text-ink"
          : "border-black/[0.06] text-muted hover:text-ink hover:border-black/[0.14]"
      }`}
    >
      <input
        type="radio"
        checked={active}
        onChange={() => setStatus(value)}
        className="!m-0 !w-4 !h-4"
        aria-label={label}
      />
      <span className="font-manrope font-semibold text-[13.5px]">{label}</span>
    </label>
  );
}

function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
  const btn = (active: boolean, disabled = false) =>
    `${TOOLBAR_BTN} ${active ? "border-crimson-600 text-crimson-600 bg-crimson-600/5" : ""}${disabled ? " opacity-40" : ""}`;
  return (
    <div className="flex flex-wrap gap-1 mb-2">
      <button type="button" aria-label="Bold" className={btn(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="w-4 h-4" />
      </button>
      <button type="button" aria-label="Italic" className={btn(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="w-4 h-4" />
      </button>
      <button type="button" aria-label="Heading 2" className={btn(editor.isActive("heading", { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 className="w-4 h-4" />
      </button>
      <button type="button" aria-label="Heading 3" className={btn(editor.isActive("heading", { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 className="w-4 h-4" />
      </button>
      <button type="button" aria-label="Bullet list" className={btn(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="w-4 h-4" />
      </button>
      <button type="button" aria-label="Numbered list" className={btn(editor.isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="w-4 h-4" />
      </button>
      <button type="button" aria-label="Blockquote" className={btn(editor.isActive("blockquote"))} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote className="w-4 h-4" />
      </button>
      <button type="button" aria-label="Inline code" className={btn(editor.isActive("code"))} onClick={() => editor.chain().focus().toggleCode().run()}>
        <Code2 className="w-4 h-4" />
      </button>
      <button type="button" aria-label="Horizontal rule" className={btn(false)} onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus className="w-4 h-4" />
      </button>
      <div className="flex-1" />
      <button type="button" aria-label="Undo" className={btn(false, !editor.can().undo())} onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
        <Undo2 className="w-4 h-4" />
      </button>
      <button type="button" aria-label="Redo" className={btn(false, !editor.can().redo())} onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
        <Redo2 className="w-4 h-4" />
      </button>
    </div>
  );
}

function formatShort(d: Date): string {
  const dt = new Date(d);
  return dt.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
