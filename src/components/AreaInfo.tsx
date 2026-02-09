import type { AreaId } from "@/lib/types";
import { AREAS, STEPS_PER_AREA } from "@/lib/constants";

export function AreaInfo({
  areaId,
  currentStep,
}: {
  areaId: AreaId;
  currentStep: number;
}) {
  const area = AREAS[areaId - 1];

  return (
    <div className="text-center">
      <h2 className="mb-2 text-xl font-bold">{area.name}</h2>
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: STEPS_PER_AREA }, (_, i) => i + 1).map((step) => (
          <div
            key={step}
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              step === currentStep
                ? "bg-blue-500 text-white"
                : step < currentStep
                  ? "bg-zinc-600 text-zinc-300"
                  : "bg-zinc-700 text-zinc-500"
            } ${step === STEPS_PER_AREA ? "ring-2 ring-red-500/50" : ""}`}
          >
            {step === STEPS_PER_AREA ? "B" : step}
          </div>
        ))}
      </div>
      <p className="mt-1 text-sm text-zinc-400">
        エリア {areaId} / 8 — マス {currentStep} / {STEPS_PER_AREA}
      </p>
    </div>
  );
}
