import type { PreviewData } from "../types";

interface Props {
  preview: PreviewData;
}

export default function DataPreview({ preview }: Props) {
  return (
    <div className="rounded-2xl border border-surface-border bg-surface overflow-hidden">
      <div className="px-5 py-3 border-b border-surface-border">
        <h3 className="text-sm font-medium text-gray-300">
          Data Preview
          <span className="text-gray-500 font-normal ml-2">
            (first {preview.rows.length} rows)
          </span>
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border">
              {preview.columns.map((col) => (
                <th
                  key={col}
                  className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap bg-dark-700"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-surface-border/50 hover:bg-surface-hover transition-colors"
              >
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className="px-4 py-2 text-gray-300 whitespace-nowrap text-xs"
                  >
                    {cell === "" || cell === null || cell === undefined
                      ? "—"
                      : String(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
