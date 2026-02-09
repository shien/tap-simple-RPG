import type { EventType, UpcomingEvent } from "@/lib/types";
import { ElementBadge } from "./ElementBadge";

const EVENT_CONFIG: Record<
  EventType,
  { label: string; color: string }
> = {
  battle: { label: "戦闘", color: "bg-red-900/60 text-red-300" },
  treasure: { label: "宝箱", color: "bg-yellow-900/60 text-yellow-300" },
  boss: { label: "BOSS", color: "bg-red-800 text-red-200 font-bold" },
};

export function EventPreview({ events }: { events: UpcomingEvent[] }) {
  if (events.length === 0) return null;

  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-3">
      <p className="mb-2 text-sm text-zinc-400">次のイベント</p>
      <div className="flex gap-2">
        {events.map((event, i) => {
          const config = EVENT_CONFIG[event.type];
          return (
            <div
              key={i}
              className={`flex items-center gap-1 rounded-md px-3 py-1 text-sm ${config.color}`}
            >
              {config.label}
              {event.enemyElement && (
                <ElementBadge element={event.enemyElement} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
