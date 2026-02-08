export function GameOverView({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="flex flex-col items-center gap-6 py-12">
      <h2 className="text-3xl font-bold text-red-500">GAME OVER</h2>
      <p className="text-zinc-400">力尽きてしまった...</p>
      <button
        onClick={onRestart}
        className="rounded-lg bg-blue-600 px-8 py-3 text-lg font-bold text-white active:bg-blue-700"
      >
        最初から
      </button>
    </div>
  );
}
