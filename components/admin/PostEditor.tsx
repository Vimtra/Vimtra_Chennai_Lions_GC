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
} from "lucide-react";
import { updatePostAction, deletePostAction } from "@/app/admin/news/actions";
import ConfirmDeleteButton from "@/components/admin/ConfirmDeleteButton";

// A rich-text editor bound to a single Post row. TipTap loads only on this
// route (client component); public /news and /news/[slug] stay editor-free.
//
// Every input lives inside a single main form so the Save action submits
// title, slug, body, cover, author, status, publish date, sort order in
// one go. Delete lives in a sibling form (HTML disallows nested forms).

const TOOLBAR_BTN =
  "inline-flex items-center justify-center w-8 h-8 rounded-[6px] border border-black/[0.14] bg-white text-ink text-[13px] hover:border-[#bd2227] hover:text-[#bd2227] disabled:opacity-40";

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
          "min-h-[420px] bg-white border border-black/[0.14] rounded-[10px] p-5 focus:outline-none focus:border-[#bd2227] focus:ring-4 focus:ring-[#bd2227]/10 " +
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
      <form action={updatePostAction} className="adm-grid adm-grid-sidebar">
        <input type="hidden" name="id" value={post.id} />
        <input type="hidden" name="bodyJson" ref={jsonRef} />
        <input type="hidden" name="bodyHtml" ref={htmlRef} />
        {/* Radios update React state; a hidden input carries the value to submit. */}
        <input type="hidden" name="status" value={status} />

        {/* -------- LEFT: editorial fields + body -------- */}
        <div className="adm-panel adm-panel-pad adm-form">
          <div className="adm-field">
            <label className="adm-label" htmlFor="post-title">
              Title
            </label>
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
              maxLength={200}
            />
          </div>

          <div className="adm-row adm-row-main-side">
            <div className="adm-field">
              <label className="adm-label" htmlFor="post-slug">
                Slug
              </label>
              <input
                id="post-slug"
                name="slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugManuallyEdited(true);
                }}
              />
              <span className="adm-hint">Public address: /news/{slug || "…"}</span>
            </div>
            <div className="adm-field">
              <label className="adm-label" htmlFor="post-category">
                Category <span className="adm-opt">optional</span>
              </label>
              <input id="post-category" name="category" defaultValue={post.category ?? ""} placeholder="Feature · Notebook" />
            </div>
          </div>

          <div className="adm-field">
            <label className="adm-label" htmlFor="post-excerpt">
              Excerpt <span className="adm-opt">1–2 lines shown on /news and in link previews</span>
            </label>
            <textarea id="post-excerpt" name="excerpt" defaultValue={post.excerpt ?? ""} rows={3} maxLength={400} />
          </div>

          <div className="adm-row adm-row-2">
            <div className="adm-field">
              <label className="adm-label" htmlFor="post-cover">
                Cover image path <span className="adm-opt">under /public, optional</span>
              </label>
              <input id="post-cover" name="coverImage" defaultValue={post.coverImage ?? ""} placeholder="/assets/photo/…jpg" />
            </div>
            <div className="adm-field">
              <label className="adm-label" htmlFor="post-author">
                Author
              </label>
              <input id="post-author" name="authorName" defaultValue={post.authorName} />
            </div>
          </div>

          <div className="adm-field">
            <span className="adm-label">Body</span>
            <EditorToolbar editor={editor} />
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* -------- RIGHT: publish sidebar -------- */}
        <aside className="adm-stack adm-sticky">
          <div className="adm-panel adm-panel-pad adm-form" style={{ gap: 14 }}>
            <div className="adm-kicker" style={{ color: "var(--adm-crimson)" }}>
              Publish
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              <StatusRadio value="DRAFT" current={status} setStatus={setStatus} label="Draft" hint="Only visible here." />
              <StatusRadio value="PUBLISHED" current={status} setStatus={setStatus} label="Published" hint="Live on /news." />
              <StatusRadio value="ARCHIVED" current={status} setStatus={setStatus} label="Archived" hint="Off the site, kept on file." />
            </div>

            <div className="adm-field">
              <label className="adm-label" htmlFor="post-publishedAt">
                Publish date <span className="adm-opt">optional</span>
              </label>
              <input id="post-publishedAt" type="datetime-local" name="publishedAt" defaultValue={toDateInputLocal(post.publishedAt)} />
              <span className="adm-hint">Left blank, it is set to now the first time the post is published.</span>
            </div>

            <div className="adm-field">
              <label className="adm-label" htmlFor="post-sort">
                Sort order <span className="adm-opt">higher pins to top</span>
              </label>
              <input id="post-sort" type="number" name="sortOrder" defaultValue={post.sortOrder} />
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <button type="submit" className="adm-btn adm-btn-primary adm-btn-block">
                Save changes
              </button>
              <Link href="/admin/news/editorial" className="adm-btn adm-btn-block">
                Cancel
              </Link>
            </div>

            <div className="adm-hint">Last updated {formatShort(post.updatedAt)}</div>
          </div>

          <div className="adm-panel adm-panel-pad">
            <div className="adm-kicker" style={{ color: "var(--adm-crimson)" }}>
              Danger zone
            </div>
            <p className="adm-sub" style={{ marginBottom: 12 }}>
              Delete permanently. Archived is usually the safer choice.
            </p>
            <ConfirmDeleteButton
              action={deletePostAction}
              id={post.id}
              label={post.title}
              meta={`/news/${post.slug}`}
              description="Permanently deletes the post and its public page. This cannot be undone."
              triggerLabel="Delete post"
              redirectTo="/admin/news/editorial"
            />
          </div>
        </aside>
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
  hint,
}: {
  value: PostStatus;
  current: PostStatus;
  setStatus: (s: PostStatus) => void;
  label: string;
  hint: string;
}) {
  const active = current === value;
  return (
    <label
      className="adm-check"
      style={active ? { borderColor: "var(--adm-crimson)", boxShadow: "0 0 0 3px rgba(189,34,39,0.08)" } : undefined}
    >
      <input type="radio" name="status-choice" checked={active} onChange={() => setStatus(value)} aria-label={label} />
      <span>
        <strong>{label}</strong>
        <span>{hint}</span>
      </span>
    </label>
  );
}

function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
  const btn = (active: boolean, disabled = false) =>
    `${TOOLBAR_BTN} ${active ? "border-crimson-600 text-crimson-600 bg-crimson-600/5" : ""}${disabled ? " opacity-40" : ""}`;
  return (
    <div className="flex flex-wrap gap-1 mb-2" role="toolbar" aria-label="Formatting">
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
