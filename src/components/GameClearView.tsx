type GameClearViewProps = {
  onRestart: () => void;
};

export function GameClearView({ onRestart }: GameClearViewProps) {
  return (
    <div className="flex flex-col items-center gap-8 py-12">
      <h2 className="rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-600 px-10 py-4 text-3xl font-bold text-white shadow-lg">
        GAME CLEAR
      </h2>
      <p className="px-4 text-center leading-relaxed text-zinc-300">
        魔王は倒され、魔王の復讐は幕を閉じた。
        <br />
        魔物たちは人を襲うことはなくなり、世界は平和になった。
      </p>
      <button
        onClick={onRestart}
        className="rounded-full border border-zinc-600 bg-zinc-800 px-10 py-4 text-xl font-bold text-zinc-100 active:bg-zinc-700"
      >
        もう一度プレイする
      </button>
    </div>
  );
}
