/**
 * Canonical set of enquiry topics used by the contact form. Kept in a
 * separate file so both the (server) page component that reads
 * `?topic=` and the (client) form can import it without pulling the
 * whole form into the server bundle.
 *
 * The set covers the enquiry types the brochure and profile explicitly
 * open — partnerships, sponsorship, media, golf development — plus
 * merchandise support for the store, and a general catch-all.
 */
export const CONTACT_TOPICS = [
  "General",
  "Partnerships",
  "Sponsorship",
  "Media",
  "Golf Development",
  "Merchandise Support",
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number];
