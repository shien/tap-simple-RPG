export function EventResultMessage({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div className="rounded-xl border-2 border-zinc-500 bg-zinc-800 px-5 py-3 text-center text-sm font-semibold text-zinc-200 shadow">
      {message}
    </div>
  );
}
