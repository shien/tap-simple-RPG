export function EventResultMessage({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div className="rounded-lg border border-zinc-600 bg-zinc-800/80 px-4 py-3 text-center text-sm">
      {message}
    </div>
  );
}
