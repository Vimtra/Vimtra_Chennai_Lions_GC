import Image from "next/image";

/**
 * Player portrait card. Renders the real photograph when provided and falls
 * back to the initials-glyph treatment for any roster row without one.
 */
export default function PlayerPortrait({
  init,
  image,
  badgeName,
  badgeSub,
  alt,
}: {
  init: string;
  image?: string;
  badgeName: string;
  badgeSub: string;
  alt?: string;
}) {
  return (
    <div className="player-portrait">
      {image ? (
        <Image
          src={image}
          alt={alt ?? badgeName}
          fill
          sizes="(max-width:768px) 100vw, (max-width:1200px) 33vw, 380px"
          className="object-cover object-top"
          style={{ zIndex: 0 }}
        />
      ) : (
        <div className="init" aria-hidden>
          {init}
        </div>
      )}
      {/* Bottom-shading so the badge always reads over photography. */}
      {image && (
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1/2 z-[1]"
          style={{
            background:
              "linear-gradient(180deg,transparent 0%,rgba(20,8,8,0.65) 100%)",
          }}
        />
      )}
      <div className="badge">
        <div className="font-sora font-bold text-[14px]">{badgeName}</div>
        <div className="font-manrope font-medium text-[11px] text-[#E9CB8E] mt-[2px]">
          {badgeSub}
        </div>
      </div>
    </div>
  );
}
