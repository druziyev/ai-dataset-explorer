import type { EdaResponse } from "../types";
import {
  Rows3,
  Columns3,
  ShieldCheck,
  Hash,
  Type,
  AlertTriangle,
} from "lucide-react";

interface Props {
  eda: EdaResponse;
}

export default function EdaPanel({ eda }: Props) {
  const summaryCards = [
    {
      label: "Rows",
      value: eda.shape.rows.toLocaleString(),
      icon: <Rows3 size={18} />,
      color: "text-indigo-400",
    },
    {
      label: "Columns",
      value: eda.shape.columns,
      icon: <Columns3 size={18} />,
      color: "text-violet-400",
    },
    {
      label: "Data Quality",
      value: `${eda.quality_score}%`,
      icon: <ShieldCheck size={18} />,
      color:
        eda.quality_score >= 90
          ? "text-emerald-400"
          : eda.quality_score >= 70
          ? "text-yellow-400"
          : "text-red-400",
    },
    {
      label: "Numeric",
      value: eda.numeric_columns.length,
      icon: <Hash size={18} />,
      color: "text-sky-400",
    },
    {
      label: "Categorical",
      value: eda.categorical_columns.length,
      icon: <Type size={18} />,
      color: "text-amber-400",
    },
  ];

  const missingCols = Object.entries(eda.missing_values).filter(
    ([, v]) => v.count > 0
  );

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl bg-surface border border-surface-border p-4 animate-slide-up"
          >
            <div className={`mb-2 ${card.color}`}>{card.icon}</div>
            <p className="text-2xl font-bold text-white">{card.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Missing values */}
      {missingCols.length > 0 && (
        <div className="rounded-2xl bg-surface border border-surface-border p-5">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
            <AlertTriangle size={14} className="text-amber-400" />
            Missing Values
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {missingCols.map(([col, info]) => (
              <div
                key={col}
                className="flex items-center justify-between bg-dark-700 rounded-xl px-4 py-2.5"
              >
                <span className="text-gray-300 text-sm truncate mr-3">
                  {col}
                </span>
                <div className="text-right shrink-0">
                  <span className="text-amber-400 text-sm font-medium">
                    {info.count.toLocaleString()}
                  </span>
                  <span className="text-gray-500 text-xs ml-1">
                    ({info.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Numeric statistics */}
      {Object.keys(eda.numeric_stats).length > 0 && (
        <div className="rounded-2xl bg-surface border border-surface-border overflow-hidden">
          <div className="px-5 py-3 border-b border-surface-border">
            <h3 className="text-sm font-semibold text-white">
              Descriptive Statistics
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border bg-dark-700">
                  {["Column", "Mean", "Std", "Min", "Q1", "Median", "Q3", "Max"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {Object.entries(eda.numeric_stats).map(([col, s]) => (
                  <tr
                    key={col}
                    className="border-b border-surface-border/50 hover:bg-surface-hover transition-colors"
                  >
                    <td className="px-4 py-2 text-gray-200 font-medium whitespace-nowrap">
                      {col}
                    </td>
                    <td className="px-4 py-2 text-gray-400">{s.mean}</td>
                    <td className="px-4 py-2 text-gray-400">{s.std}</td>
                    <td className="px-4 py-2 text-gray-400">{s.min}</td>
                    <td className="px-4 py-2 text-gray-400">{s.q1}</td>
                    <td className="px-4 py-2 text-gray-400">{s.median}</td>
                    <td className="px-4 py-2 text-gray-400">{s.q3}</td>
                    <td className="px-4 py-2 text-gray-400">{s.max}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Categorical info */}
      {Object.keys(eda.categorical_info).length > 0 && (
        <div className="rounded-2xl bg-surface border border-surface-border p-5">
          <h3 className="text-sm font-semibold text-white mb-4">
            Categorical Columns
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(eda.categorical_info).map(([col, info]) => (
              <div
                key={col}
                className="bg-dark-700 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-200 text-sm font-medium">
                    {col}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {info.unique_count} unique
                  </span>
                </div>
                <div className="space-y-1.5">
                  {Object.entries(info.top_values)
                    .slice(0, 5)
                    .map(([val, count]) => {
                      const maxCount = Math.max(
                        ...Object.values(info.top_values)
                      );
                      const pct = Math.round((count / maxCount) * 100);
                      return (
                        <div key={val} className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 w-24 truncate shrink-0">
                            {val}
                          </span>
                          <div className="flex-1 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-10 text-right shrink-0">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Column types overview */}
      <div className="rounded-2xl bg-surface border border-surface-border p-5">
        <h3 className="text-sm font-semibold text-white mb-4">
          Column Types
        </h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(eda.column_types).map(([col, type]) => {
            const colors: Record<string, string> = {
              numeric:
                "bg-sky-500/10 text-sky-400 border-sky-500/20",
              categorical:
                "bg-amber-500/10 text-amber-400 border-amber-500/20",
              datetime:
                "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
              text: "bg-purple-500/10 text-purple-400 border-purple-500/20",
            };
            return (
              <span
                key={col}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${
                  colors[type] || colors.text
                }`}
              >
                {col}
                <span className="opacity-60">({type})</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
