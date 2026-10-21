import type { ActivityRow, HourColumn } from "./score-types";

type Props = {
  rows: ActivityRow[];
  hours: HourColumn[];
};

export function ScoreTable({ rows, hours }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200">
      <table className="text-sm">
        <thead>
          <tr>
            <th scope="col" className="sticky left-0 bg-white p-2 text-left">
              Hour
            </th>
            {hours.map((hour) => (
              <th key={hour.time} scope="col" className="min-w-14 p-2 font-normal text-neutral-500">
                <span className="block text-xs">{hour.dayLabel}</span>
                {hour.hourLabel}
              </th>
            ))}
          </tr>
          <tr className="border-b border-neutral-200">
            <th scope="row" className="sticky left-0 whitespace-nowrap bg-white p-2 text-left font-normal text-neutral-500">
              Feels like
            </th>
            {hours.map((hour) => (
              <td key={hour.time} className="p-2 text-center text-neutral-500">
                {Math.round(hour.feelsLikeF)}°
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <th scope="row" className="sticky left-0 bg-white p-2 text-left">
                {row.label}
              </th>
              {row.cells.map((cell, i) => (
                <td
                  key={hours[i]?.time ?? i}
                  title={cell.reasonLabel}
                  className={`p-2 text-center ${cell.isBest ? "font-semibold underline" : ""}`}
                >
                  {cell.score}
                  {cell.isBest && <span className="sr-only"> best hour</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
