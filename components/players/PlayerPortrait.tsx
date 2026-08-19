export default function PlayerPortrait({
  init,
  badgeName,
  badgeSub,
}: {
  init: string;
  badgeName: string;
  badgeSub: string;
}) {
  return (
    <div className="player-portrait">
      <div className="init">{init}</div>
      <div className="badge">
        <div className="font-sora font-bold text-[14px]">{badgeName}</div>
        <div className="font-manrope font-medium text-[11px] text-[#E9CB8E] mt-[2px]">
          {badgeSub}
        </div>
      </div>
    </div>
  );
}
