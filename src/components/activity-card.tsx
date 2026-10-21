import type { ActivityRow, HourColumn } from "./score-types";

type Props = {
  row: ActivityRow;
  hours: HourColumn[];
};

export function ActivityCard({ row, hours }: Props) {
  const bestHour = row.bestIndex === null ? undefined : hours[row.bestIndex];
  const bestCell = row.bestIndex === null ? undefined : row.cells[row.bestIndex];

  return (
    <section aria-labelledby={`${row.id}-title`} className="rounded-lg border border-neutral-200 p-4">
      <h2 id={`${row.id}-title`} className="text-lg font-semibold">
        {row.label}
      </h2>

      {bestHour && bestCell && (
        <div className="mt-1">
          <p>
            Best: {bestHour.dayLabel} {bestHour.hourLabel} · <strong>{bestCell.score}</strong> ·{" "}
            {bestCell.reasonLabel}
          </p>
          <p className="text-sm text-neutral-600">
            Feels {Math.round(bestHour.feelsLikeF)}°F · wind {Math.round(bestHour.windMph)} mph ·{" "}
            {bestHour.precipitationChance}% rain
          </p>
        </div>
      )}

      <ol className="mt-3 flex gap-2 overflow-x-auto pb-2">
        {row.cells.map((cell, i) => {
          const hour = hours[i];
          if (!hour) return null;
          return (
            <li
              key={hour.time}
              title={cell.reasonLabel}
              className={`flex min-w-14 flex-col items-center rounded border px-2 py-1 text-sm ${
                cell.isBest ? "border-neutral-900 font-semibold" : "border-neutral-200"
              }`}
            >
              <span className="text-xs text-neutral-500">{hour.hourLabel}</span>
              <span className="text-base">{cell.score}</span>
              <span className="text-xs text-neutral-500">{Math.round(hour.feelsLikeF)}°</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
