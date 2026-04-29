/* ── Shared TypeScript interfaces for API responses ── */

export interface DatasetInfo {
  shape: { rows: number; columns: number };
  columns: string[];
  dtypes: Record<string, string>;
  column_types: Record<string, string>;
  memory_usage_mb: number;
}

export interface PreviewData {
  columns: string[];
  rows: (string | number)[][];
  dtypes: Record<string, string>;
}

export interface UploadResponse {
  session_id: string;
  filename: string;
  info: DatasetInfo;
  preview: PreviewData;
}

export interface MissingValueInfo {
  count: number;
  percentage: number;
}

export interface NumericStat {
  count: number;
  mean: number;
  std: number;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
}

export interface CategoricalInfo {
  unique_count: number;
  top_values: Record<string, number>;
}

export interface CorrelationData {
  columns: string[];
  values: number[][];
}

export interface EdaResponse {
  shape: { rows: number; columns: number };
  dtypes: Record<string, string>;
  column_types: Record<string, string>;
  missing_values: Record<string, MissingValueInfo>;
  numeric_stats: Record<string, NumericStat>;
  categorical_info: Record<string, CategoricalInfo>;
  correlation: CorrelationData;
  quality_score: number;
  numeric_columns: string[];
  categorical_columns: string[];
}

export interface ChartData {
  id: string;
  type: string;
  title: string;
  figure: Record<string, unknown>;
}

export interface ChartsResponse {
  charts: ChartData[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export type AppView = "upload" | "preview" | "analyzing" | "dashboard";
