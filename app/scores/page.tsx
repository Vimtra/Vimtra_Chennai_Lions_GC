import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import AeText from "@/components/AeText";
import { listFixtures, formatFixtureDate } from "@/lib/fixtures";

export const metadata: Metadata = {
  title: "Scores · Vimtra Chennai Lions GC",
  description:
    "Live tournament scoring for the Vimtra Chennai Lions across the AM Green IGPL Season 2026 — unlocks as each round begins.",
};

// Live rounds change every few minutes during a tournament week; always
// resolve against the current DB row set.
export const dynamic = "force-dynamic";

// The page reads the current Fixture set from the database and shows one
// of three honest states, in priority order:
//
//   1. If any fixture is LIVE  → summary of that fixture + placeholder
//      leaderboard slot (real rows land here once an admin keys them in,
//      or once the IGPL sync writes to the Score table).
//   2. If a fixture is UPCOMING → count-down card pointing at it.
//   3. If everything is COMPLETED → results-only state.
//
// Nothing on this page is fabricated. Player leaderboards, hole-by-hole
// scorecards, and shot updates only appear once real Score rows exist.

export default async function ScoresPage() {
  const fixtures = await listFixtures();
  const live = fixtures.find((f) => f.status === "LIVE") ?? null;
  const nextUp = fixtures.find((f) => f.status === "UPCOMING") ?? null;
  const lastResult =
    [...fixtures]
      .reverse()
      .find((f) => f.status === "COMPLETED") ?? null;

  return (
    <>
      <section
        className="relative overflow-hidden px-8 pt-[78px] pb-16"
        style={{
          background:
            "radial-gradient(125% 105% at 50% -5%,#C9242E 0%,#A8181F 58%,#871119 100%)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 84% 16%,rgba(233,203,142,0.16),transparent 42%)",
          }}
        />
        <div className="relative max-w-[1200px] mx-auto">
          <div className="flex items-center gap-[14px] flex-wrap">
            {live ? (
              <span className="badge-live">LIVE</span>
            ) : (
              <span className="tier-badge" style={{ background: "rgba(255,255,255,0.14)", color: "#E9CB8E" }}>
                OFFLINE
              </span>
            )}
            <span className="font-manrope font-bold text-[12px] tracking-[0.32em] text-[#E9CB8E] uppercase">
              AM Green IGPL · Season 2026
            </span>
          </div>
          <AeText
            text="SCORES"
            mode="words"
            as="h1"
            className="mt-[18px] font-sora font-extrabold text-white"
            style={{
              fontSize: "clamp(48px,7.4vw,108px)",
              lineHeight: 0.92,
              letterSpacing: "-0.035em",
            }}
          />
          <Reveal
            variant="fade-up"
            delay={120}
            as="p"
            className="max-w-[640px] mt-[18px] font-manrope text-[16px] leading-[1.6] text-white/85"
          >
            {live
              ? `Round updates from ${live.name}. New rows populate here as the round moves.`
              : nextUp
              ? `Live scoring unlocks at the ${nextUp.name} — ${formatFixtureDate(nextUp)}.`
              : lastResult
              ? `No live round today. See the last completed event below.`
              : `Live scoring unlocks with the first Season 2026 tournament week.`}
          </Reveal>
        </div>
      </section>

      <section className="bg-cream-100 px-8 pt-16 pb-24">
        <div className="max-w-[1100px] mx-auto">
          {live ? (
            <LiveEmptyState
              name={live.name}
              context={`${live.courseName ? `${live.courseName} · ` : ""}${live.city}${
                live.city !== live.country ? `, ${live.country}` : ""
              } · ${formatFixtureDate(live)}`}
            />
          ) : nextUp ? (
            <NextUpState
              name={nextUp.name}
              date={formatFixtureDate(nextUp)}
              venue={`${nextUp.courseName ?? "Venue TBA"} · ${nextUp.city}, ${nextUp.country}`}
              presentedBy={nextUp.presentedBy ?? null}
            />
          ) : lastResult ? (
            <LastResultState
              name={lastResult.name}
              date={formatFixtureDate(lastResult)}
              venue={`${lastResult.courseName ?? ""}${lastResult.courseName ? " · " : ""}${lastResult.city}, ${lastResult.country}`}
            />
          ) : (
            <SeasonNotStartedState />
          )}
        </div>
      </section>
    </>
  );
}

// ---------------------------------------------------------------------------

function EmptyCard({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal
      variant="fade-up"
      className="rounded-[22px] border border-dashed border-black/[0.18] bg-cream-50 p-10 md:p-12"
    >
      <div className="font-manrope font-bold text-[10.5px] tracking-[0.28em] text-crimson-600 uppercase">
        {eyebrow}
      </div>
      <h2 className="mt-3 mb-4 font-sora font-extrabold text-[clamp(26px,3.4vw,36px)] leading-[1.15] tracking-[-0.02em] text-ink">
        {title}
      </h2>
      <div className="font-manrope text-[15px] leading-[1.68] text-muted max-w-[640px]">
        {children}
      </div>
      <div className="mt-7 flex flex-wrap gap-3">
        <Link
          href="/fixtures"
          className="cta-gold press"
          style={{ padding: "12px 22px", fontSize: 13 }}
        >
          SEE THE CALENDAR
        </Link>
        <Link
          href="/leaderboards"
          className="press inline-flex items-center gap-2 px-5 py-[11px] rounded-[30px] border border-ink/25 text-ink font-manrope font-bold text-[13px] no-underline"
        >
          LEADERBOARDS →
        </Link>
      </div>
    </Reveal>
  );
}

function LiveEmptyState({ name, context }: { name: string; context: string }) {
  return (
    <EmptyCard eyebrow="Live · Round in Progress" title={name}>
      <p className="mb-2">
        <strong>{context}</strong>
      </p>
      <p>
        Player rows will populate this page as the round moves. Nothing is
        published here before it is verified — the live leaderboard, per-round
        splits, and shot updates unlock once the official round data starts
        flowing.
      </p>
    </EmptyCard>
  );
}

function NextUpState({
  name,
  date,
  venue,
  presentedBy,
}: {
  name: string;
  date: string;
  venue: string;
  presentedBy: string | null;
}) {
  return (
    <EmptyCard
      eyebrow={`Next Up · ${date}`}
      title={name}
    >
      <p className="mb-2">
        <strong>{venue}</strong>
      </p>
      <p>
        Live scoring for this tournament unlocks the moment the first round
        tees off.
        {presentedBy ? ` Presented by ${presentedBy}.` : ""} No provisional
        leaderboards or forecast data are published on this page — only
        verified round scores as they land.
      </p>
    </EmptyCard>
  );
}

function LastResultState({
  name,
  date,
  venue,
}: {
  name: string;
  date: string;
  venue: string;
}) {
  return (
    <EmptyCard eyebrow={`Last Completed · ${date}`} title={name}>
      <p className="mb-2">
        <strong>{venue}</strong>
      </p>
      <p>
        No live round is currently in play. Detailed scorecards will appear
        here for the next tournament week; the finalised round result for the
        event above will be published on the Chennai Lions social channels
        and on{" "}
        <Link href="/news" className="text-crimson-600 no-underline">
          /news
        </Link>{" "}
        as it is confirmed.
      </p>
    </EmptyCard>
  );
}

function SeasonNotStartedState() {
  return (
    <EmptyCard eyebrow="Season 2026 · Not Yet Underway" title="Live scoring is offline.">
      <p>
        The Chennai Lions Season 2026 opener is the AM Green IGPL Invitational
        at Al Hamra Golf Club, Ras Al Khaimah — 23–25 September 2026. This
        page unlocks the moment the first round tees off. Until then, see
        the calendar for the full published list of Season 2026 events.
      </p>
    </EmptyCard>
  );
}
