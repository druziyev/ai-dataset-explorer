"""Chart generation using Plotly — returns JSON-serializable figure dicts."""

import numpy as np
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from plotly.utils import PlotlyJSONEncoder
import json

from services.data_service import classify_column


# Shared dark theme layout
LAYOUT_TEMPLATE = dict(
    paper_bgcolor="rgba(0,0,0,0)",
    plot_bgcolor="rgba(0,0,0,0)",
    font=dict(color="#e5e7eb", family="Inter, sans-serif", size=12),
    margin=dict(l=50, r=30, t=50, b=50),
    xaxis=dict(gridcolor="rgba(255,255,255,0.06)", zerolinecolor="rgba(255,255,255,0.06)"),
    yaxis=dict(gridcolor="rgba(255,255,255,0.06)", zerolinecolor="rgba(255,255,255,0.06)"),
    colorway=[
        "#6366f1", "#8b5cf6", "#a78bfa", "#c084fc",
        "#818cf8", "#60a5fa", "#38bdf8", "#22d3ee",
        "#34d399", "#4ade80", "#facc15", "#fb923c",
    ],
)


def _fig_to_json(fig) -> dict:
    """Convert a Plotly figure to a JSON-serializable dict."""
    return json.loads(json.dumps(fig.to_dict(), cls=PlotlyJSONEncoder))


def generate_charts(df: pd.DataFrame) -> list[dict]:
    """Auto-generate relevant charts based on column types."""
    charts = []
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = [
        col for col in df.columns if classify_column(df[col]) == "categorical"
    ]

    # 1. Histograms for numeric columns (up to 6)
    for col in numeric_cols[:6]:
        fig = px.histogram(
            df, x=col, nbins=30,
            title=f"Distribution of {col}",
            color_discrete_sequence=["#6366f1"],
        )
        fig.update_layout(**LAYOUT_TEMPLATE)
        charts.append({
            "id": f"hist_{col}",
            "type": "histogram",
            "title": f"Distribution of {col}",
            "figure": _fig_to_json(fig),
        })

    # 2. Bar charts for categorical columns (up to 4)
    for col in categorical_cols[:4]:
        vc = df[col].value_counts().head(10)
        fig = go.Figure(
            data=[go.Bar(
                x=vc.index.astype(str).tolist(),
                y=vc.values.tolist(),
                marker_color="#8b5cf6",
                marker_cornerradius=6,
            )]
        )
        fig.update_layout(
            title=f"Top Values — {col}",
            xaxis_title=col,
            yaxis_title="Count",
            **LAYOUT_TEMPLATE,
        )
        charts.append({
            "id": f"bar_{col}",
            "type": "bar",
            "title": f"Top Values — {col}",
            "figure": _fig_to_json(fig),
        })

    # 3. Correlation heatmap
    if len(numeric_cols) >= 2:
        corr = df[numeric_cols].corr()
        fig = go.Figure(
            data=go.Heatmap(
                z=corr.values.tolist(),
                x=numeric_cols,
                y=numeric_cols,
                colorscale=[
                    [0, "#312e81"],
                    [0.5, "#1e1b4b"],
                    [1, "#6366f1"],
                ],
                zmin=-1, zmax=1,
                text=np.round(corr.values, 2).tolist(),
                texttemplate="%{text}",
                textfont=dict(size=10, color="#e5e7eb"),
            )
        )
        fig.update_layout(
            title="Correlation Heatmap",
            **LAYOUT_TEMPLATE,
        )
        charts.append({
            "id": "correlation_heatmap",
            "type": "heatmap",
            "title": "Correlation Heatmap",
            "figure": _fig_to_json(fig),
        })

    # 4. Box plots for numeric columns (up to 6)
    if numeric_cols:
        cols_for_box = numeric_cols[:6]
        fig = go.Figure()
        for i, col in enumerate(cols_for_box):
            fig.add_trace(go.Box(
                y=df[col].dropna().tolist(),
                name=col,
                marker_color=LAYOUT_TEMPLATE["colorway"][i % len(LAYOUT_TEMPLATE["colorway"])],
            ))
        fig.update_layout(
            title="Box Plots — Numeric Columns",
            **LAYOUT_TEMPLATE,
        )
        charts.append({
            "id": "box_plots",
            "type": "box",
            "title": "Box Plots — Numeric Columns",
            "figure": _fig_to_json(fig),
        })

    # 5. Scatter plot for top-correlated pair
    if len(numeric_cols) >= 2:
        corr = df[numeric_cols].corr().abs()
        np.fill_diagonal(corr.values, 0)
        max_idx = np.unravel_index(corr.values.argmax(), corr.shape)
        col_x = numeric_cols[max_idx[0]]
        col_y = numeric_cols[max_idx[1]]

        fig = px.scatter(
            df, x=col_x, y=col_y,
            title=f"Scatter — {col_x} vs {col_y}",
            color_discrete_sequence=["#a78bfa"],
            opacity=0.6,
            trendline="ols",
        )
        fig.update_layout(**LAYOUT_TEMPLATE)
        charts.append({
            "id": "scatter_top_corr",
            "type": "scatter",
            "title": f"Scatter — {col_x} vs {col_y}",
            "figure": _fig_to_json(fig),
        })

    # 6. Pie chart for first categorical column
    if categorical_cols:
        col = categorical_cols[0]
        vc = df[col].value_counts().head(8)
        fig = go.Figure(
            data=[go.Pie(
                labels=vc.index.astype(str).tolist(),
                values=vc.values.tolist(),
                hole=0.45,
                marker=dict(colors=LAYOUT_TEMPLATE["colorway"][:len(vc)]),
                textfont=dict(color="#e5e7eb"),
            )]
        )
        fig.update_layout(
            title=f"Distribution — {col}",
            **LAYOUT_TEMPLATE,
        )
        charts.append({
            "id": f"pie_{col}",
            "type": "pie",
            "title": f"Distribution — {col}",
            "figure": _fig_to_json(fig),
        })

    return charts
