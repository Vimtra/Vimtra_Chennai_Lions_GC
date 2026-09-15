import "server-only";
import sanitizeHtml from "sanitize-html";

const NEWS_ALLOWED_TAGS = [
  "h2",
  "h3",
  "p",
  "strong",
  "em",
  "s",
  "blockquote",
  "code",
  "pre",
  "ul",
  "ol",
  "li",
  "hr",
  "a",
  "img",
];

/** Keep Post.bodyHtml limited to the markup the TipTap article body needs. */
export function sanitizeNewsHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: NEWS_ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href"],
      img: ["src", "alt"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      a: ["http", "https", "mailto"],
      img: ["http", "https"],
    },
    allowProtocolRelative: false,
    disallowedTagsMode: "discard",
  });
}