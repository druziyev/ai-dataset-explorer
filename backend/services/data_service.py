"""Data parsing, cleaning, and EDA logic."""

import io
from pathlib import Path

import numpy as np
import pandas as pd


def parse_file(file_bytes: bytes, filename: str) -> pd.DataFrame:
    """Parse an uploaded file into a pandas DataFrame."""
    ext = Path(filename).suffix.lower()

    if ext == ".csv":
        df = pd.read_csv(io.BytesIO(file_bytes))
    elif ext in (".xlsx", ".xls"):
        df = pd.read_excel(io.BytesIO(file_bytes))
    elif ext == ".json":
        df = pd.read_json(io.BytesIO(file_bytes))
    else:
        raise ValueError(f"Unsupported file format: {ext}")

    return df


def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """Basic data cleaning: strip whitespace, infer types."""
    df = df.copy()

    # Strip whitespace from string columns
    for col in df.select_dtypes(include=["object"]).columns:
        df[col] = df[col].astype(str).str.strip()
        df[col] = df[col].replace(["nan", "None", ""], pd.NA)

    # Try to convert numeric-looking columns
    for col in df.columns:
        if df[col].dtype == object:
            try:
                converted = pd.to_numeric(df[col], errors="coerce")
                if converted.notna().sum() / len(df) > 0.5:
                    df[col] = converted
            except (ValueError, TypeError):
                pass

    return df


def classify_column(series: pd.Series) -> str:
    """Classify a column as numeric, categorical, datetime, or text."""
    if pd.api.types.is_numeric_dtype(series):
        return "numeric"
    if pd.api.types.is_datetime64_any_dtype(series):
        return "datetime"

    # Try to parse as datetime
    try:
        pd.to_datetime(series.dropna().head(20), format="mixed")
        return "datetime"
    except (ValueError, TypeError):
        pass

    nunique = series.nunique()
    if nunique <= 30 or nunique / len(series) < 0.3:
        return "categorical"

    return "text"


def get_preview(df: pd.DataFrame, n_rows: int = 20) -> dict:
    """Get a preview of the dataset (first n rows)."""
    preview_df = df.head(n_rows)
    return {
        "columns": list(df.columns),
        "rows": preview_df.fillna("").values.tolist(),
        "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
    }


def get_dataset_info(df: pd.DataFrame) -> dict:
    """Get basic dataset information."""
    return {
        "shape": {"rows": int(df.shape[0]), "columns": int(df.shape[1])},
        "columns": list(df.columns),
        "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
        "column_types": {col: classify_column(df[col]) for col in df.columns},
        "memory_usage_mb": round(df.memory_usage(deep=True).sum() / 1024 / 1024, 2),
    }


def get_eda(df: pd.DataFrame) -> dict:
    """Generate comprehensive EDA results."""
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = [
        col for col in df.columns if classify_column(df[col]) == "categorical"
    ]

    # Missing values
    missing = df.isnull().sum()
    missing_info = {
        col: {
            "count": int(missing[col]),
            "percentage": round(float(missing[col] / len(df) * 100), 2),
        }
        for col in df.columns
    }

    # Descriptive statistics for numeric columns
    stats = {}
    if numeric_cols:
        desc = df[numeric_cols].describe()
        for col in numeric_cols:
            stats[col] = {
                "count": int(desc.loc["count", col]),
                "mean": round(float(desc.loc["mean", col]), 4),
                "std": round(float(desc.loc["std", col]), 4),
                "min": round(float(desc.loc["min", col]), 4),
                "q1": round(float(desc.loc["25%", col]), 4),
                "median": round(float(desc.loc["50%", col]), 4),
                "q3": round(float(desc.loc["75%", col]), 4),
                "max": round(float(desc.loc["max", col]), 4),
            }

    # Categorical info
    categorical_info = {}
    for col in categorical_cols:
        vc = df[col].value_counts().head(10)
        categorical_info[col] = {
            "unique_count": int(df[col].nunique()),
            "top_values": {str(k): int(v) for k, v in vc.items()},
        }

    # Correlation matrix for numeric columns
    correlation = {}
    if len(numeric_cols) >= 2:
        corr_matrix = df[numeric_cols].corr()
        correlation = {
            "columns": numeric_cols,
            "values": corr_matrix.fillna(0).values.tolist(),
        }

    # Data quality score
    total_cells = df.shape[0] * df.shape[1]
    non_null_cells = df.notna().sum().sum()
    quality_score = round(float(non_null_cells / total_cells * 100), 1) if total_cells > 0 else 0

    return {
        "shape": {"rows": int(df.shape[0]), "columns": int(df.shape[1])},
        "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
        "column_types": {col: classify_column(df[col]) for col in df.columns},
        "missing_values": missing_info,
        "numeric_stats": stats,
        "categorical_info": categorical_info,
        "correlation": correlation,
        "quality_score": quality_score,
        "numeric_columns": numeric_cols,
        "categorical_columns": categorical_cols,
    }
