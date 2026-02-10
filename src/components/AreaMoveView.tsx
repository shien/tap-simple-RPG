import type { AreaId } from "@/lib/types";
import { AREAS } from "@/lib/constants";

export function AreaMoveView({
  areaId,
  onConfirm,
}: {
  areaId: AreaId;
  onConfirm: () => void;
}) {
  const area = AREAS[areaId - 1];

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-12">
      <p className="text-sm text-zinc-400">次のエリア</p>
      <h2 className="text-3xl font-bold text-white">{area.name}</h2>
      <p className="text-sm text-zinc-400">エリア {areaId} / 8</p>
      <button
        onClick={onConfirm}
        className="w-full rounded-full bg-blue-600 py-4 text-lg font-bold text-white active:bg-blue-700"
      >
        移動する
      </button>
    </div>
  );
}
