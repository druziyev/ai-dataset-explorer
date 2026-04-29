import { useEffect, useRef } from "react";
import type { ChartData } from "../types";

/* global Plotly object – loaded via plotly.js-dist-min */
declare global {
  interface Window {
    Plotly: typeof import("plotly.js-dist-min");
  }
}

interface Props {
  charts: ChartData[];
}

function PlotlyChart({ chart }: { chart: ChartData }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const fig = chart.figure as { data?: object[]; layout?: object };

    import("plotly.js-dist-min").then((Plotly) => {
      if (!containerRef.current) return;
      Plotly.newPlot(
        containerRef.current,
        (fig.data as Plotly.Data[]) || [],
        {
          ...(fig.layout || {}),
          autosize: true,
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          font: { color: "#e5e7eb", family: "Inter, sans-serif", size: 11 },
          margin: { l: 50, r: 20, t: 40, b: 50 },
          xaxis: {
            ...((fig.layout as Record<string, unknown>)?.xaxis as object || {}),
            gridcolor: "rgba(255,255,255,0.06)",
          },
          yaxis: {
            ...((fig.layout as Record<string, unknown>)?.yaxis as object || {}),
            gridcolor: "rgba(255,255,255,0.06)",
          },
        } as Partial<Plotly.Layout>,
        {
          responsive: true,
          displayModeBar: true,
          displaylogo: false,
          modeBarButtonsToRemove: [
            "lasso2d",
            "select2d",
            "autoScale2d",
          ] as Plotly.ModeBarDefaultButtons[],
        }
      );
    });

    return () => {
      if (containerRef.current) {
        import("plotly.js-dist-min").then((Plotly) => {
          if (containerRef.current) Plotly.purge(containerRef.current);
        });
      }
    };
  }, [chart]);

  return (
    <div
      className="rounded-2xl bg-surface border border-surface-border p-4 animate-slide-up"
    >
      <h4 className="text-sm font-medium text-gray-300 mb-3 px-1">
        {chart.title}
      </h4>
      <div ref={containerRef} className="w-full" style={{ height: 320 }} />
    </div>
  );
}

export default function ChartsPanel({ charts }: Props) {
  if (!charts.length) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-sm">
          No charts could be generated for this dataset.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {charts.map((chart) => (
        <PlotlyChart key={chart.id} chart={chart} />
      ))}
    </div>
  );
}
