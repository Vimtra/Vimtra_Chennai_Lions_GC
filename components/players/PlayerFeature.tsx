import Reveal from "@/components/Reveal";
import PlayerPortrait from "./PlayerPortrait";
import type { PlayerFeature as PF } from "@/data/players";

export default function PlayerFeature({ f }: { f: PF }) {
  const portrait = (
    <Reveal variant="fade-up">
      <PlayerPortrait init={f.init} badgeName={f.badgeName} badgeSub={f.badgeSub} />
      {f.stats && (
        <div className="mt-[18px] grid grid-cols-2 gap-[10px]">
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
      <h2 className="mt-[14px] mb-2 font-sora font-extrabold text-[clamp(38px,5vw,54px)] leading-none tracking-[-0.03em] text-ink">
        {f.name}
      </h2>
      {f.meta && <div className="font-manrope text-[14px] text-muted">{f.meta}</div>}
      {f.paragraphs.map((p, i) => (
        <p
          key={i}
          className={`${i === 0 ? "mt-[22px]" : "mt-[14px]"} font-manrope text-[15.5px] leading-[1.7] text-[#3a322d]`}
          dangerouslySetInnerHTML={{ __html: p }}
        />
      ))}
      {f.sideCards && (
        <div className="mt-[30px] grid grid-cols-1 sm:grid-cols-2 gap-[18px]">
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

  const cols = f.reverse ? "lg:grid-cols-[1.4fr_1fr]" : "lg:grid-cols-[1fr_1.4fr]";

  return (
    <section
      id={f.anchor}
      className="px-8 py-[104px] scroll-mt-24"
      style={{
        background: f.bg,
        borderTop: f.topBorder ? "1px solid rgba(26,21,19,0.06)" : undefined,
      }}
    >
      <div className={`max-w-[1200px] mx-auto grid grid-cols-1 ${cols} gap-[54px] items-start`}>
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
