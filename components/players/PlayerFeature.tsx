import Reveal from "@/components/Reveal";
import PlayerPortrait from "./PlayerPortrait";
import type { PlayerFeature as PF } from "@/data/players";

export default function PlayerFeature({ f }: { f: PF }) {
  const portrait = (
    <Reveal variant="fade-up">
      <PlayerPortrait
        init={f.init}
        image={f.image}
        badgeName={f.badgeName}
        badgeSub={f.badgeSub}
        alt={`${f.name} — Vimtra Chennai Lions GC`}
      />
      {f.stats && (
        <div className="pf-stats">
          {f.stats.map((s, i) => (
            <div className="stat" key={i}>
              <div className="v">{s.v}</div>
              <div className="l">{s.l}</div>
            </div>
          ))}
        </div>
      )}
    </Reveal>
  );

  const prose = (
    <Reveal variant="fade-up" delay={120}>
      <div className="font-manrope font-bold tracking-[0.22em] text-[11.5px] text-crimson-600 uppercase">
        {f.eyebrow}
      </div>
      <h2 className="pf-name">
        {f.name}
      </h2>
      {f.meta && <div className="font-manrope text-[14px] text-muted">{f.meta}</div>}
      {f.paragraphs.map((p, i) => (
        <p
          key={i}
          className={`pf-para ${i === 0 ? "pf-para-first" : ""}`}
          dangerouslySetInnerHTML={{ __html: p }}
        />
      ))}
      {f.sideCards && (
        <div className="pf-sides">
          {f.sideCards.map((c, i) => (
            <div
              key={i}
              className="bg-white border border-black/[0.06] rounded-[18px] p-[18px]"
            >
              <div className="font-manrope text-[11.5px] text-crimson-600 tracking-[0.12em] uppercase">
                {c.label}
              </div>
              <div className="font-sora font-bold text-[18px] text-ink mt-[6px]">
                {c.title}
              </div>
              <div className="font-manrope text-[13px] text-muted mt-[6px]">{c.sub}</div>
            </div>
          ))}
        </div>
      )}
    </Reveal>
  );

  // Portrait 5 cols / prose 6 cols with one column of air between —
  // the same geometry as .hp-split, so a player feature lines up with
  // every other section in the Club module. `reverse` swaps sides for
  // rhythm without changing the column math.
  const cols = f.reverse ? "pf-grid is-reverse" : "pf-grid";

  return (
    <section
      id={f.anchor}
      className="hp-sec hp-sec-default scroll-mt-24"
      style={{
        background: f.bg,
        borderTop: f.topBorder ? "1px solid rgba(26,21,19,0.06)" : undefined,
      }}
    >
      {/* hp-wrap so the roster shares the header/footer left edge.
          items-center is an explicit choice: the prose sits on the
          portrait’s optical centre rather than floating at its top. */}
      <div className={`hp-wrap ${cols}`}>
        {f.reverse ? (
          <>
            {prose}
            {portrait}
          </>
        ) : (
          <>
            {portrait}
            {prose}
          </>
        )}
      </div>
    </section>
  );
}
