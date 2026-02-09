"use client";

type StartScreenProps = {
  onStart: () => void;
};

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-12">
      <h1 className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-4xl font-bold tracking-wide text-white shadow-lg">タップRPG</h1>
      <button
        onClick={onStart}
        className="rounded-full border border-zinc-600 bg-zinc-800 px-10 py-4 text-xl font-bold text-zinc-100 active:bg-zinc-700"
      >
        ゲームスタート
      </button>
    </div>
  );
}
