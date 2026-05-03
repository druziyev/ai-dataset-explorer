"""AI service — OpenAI-powered data Q&A with streaming."""

import asyncio
import threading
from typing import AsyncGenerator

import pandas as pd
from openai import OpenAI

from config import settings

# Initialise the OpenAI client once
_client = OpenAI(api_key=settings.OPENAI_API_KEY)


def _build_dataframe_context(df: pd.DataFrame) -> str:
    """Create a concise textual summary of the DataFrame for the LLM."""
    shape = f"{df.shape[0]} rows × {df.shape[1]} columns"
    cols = ", ".join(df.columns.tolist()[:40])

    # Descriptive stats
    desc = df.describe(include="all").to_string()

    # Missing values
    missing = df.isnull().sum()
    missing_str = (
        missing[missing > 0].to_string() if missing.any() else "No missing values"
    )

    # Sample rows
    sample = df.head(5).to_string()

    return (
        f"Shape: {shape}\n"
        f"Columns: {cols}\n\n"
        f"Descriptive Statistics:\n{desc}\n\n"
        f"Missing Values:\n{missing_str}\n\n"
        f"Sample Rows (first 5):\n{sample}"
    )


SYSTEM_PROMPT = (
    "You are an expert data analyst. You have access to a dataset described below. "
    "When answering questions, always provide specific numbers, statistics, and insights. "
    "Be concise but thorough. Use markdown formatting in your answers when helpful. "
    "If the user asks for calculations you cannot perform exactly from the summary, "
    "explain what analysis you would recommend and provide your best estimate from "
    "the statistics available."
)


async def stream_agent_response(
    df: pd.DataFrame, message: str
) -> AsyncGenerator[str, None]:
    """Stream tokens from OpenAI as an async generator."""
    loop = asyncio.get_event_loop()
    queue: asyncio.Queue = asyncio.Queue()

    context = _build_dataframe_context(df)

    def run_openai():
        try:
            stream = _client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                temperature=0,
                stream=True,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {
                        "role": "user",
                        "content": (
                            f"Here is the dataset I'm working with:\n\n"
                            f"{context}\n\n"
                            f"My question: {message}"
                        ),
                    },
                ],
            )
            for chunk in stream:
                delta = chunk.choices[0].delta
                if delta.content:
                    asyncio.run_coroutine_threadsafe(
                        queue.put(delta.content), loop
                    )
        except Exception as e:
            asyncio.run_coroutine_threadsafe(
                queue.put(f"\n\n⚠️ Error: {str(e)}"), loop
            )
        finally:
            asyncio.run_coroutine_threadsafe(queue.put(None), loop)

    thread = threading.Thread(target=run_openai, daemon=True)
    thread.start()

    while True:
        try:
            token = await asyncio.wait_for(queue.get(), timeout=120)
        except asyncio.TimeoutError:
            yield "\n\n⚠️ Response timed out."
            break
        if token is None:
            break
        yield token


def get_ai_summary(df: pd.DataFrame) -> str:
    """Generate a one-shot AI summary of the dataset (non-streaming)."""
    context = _build_dataframe_context(df)

    prompt = (
        f"You are an expert data analyst. Analyze this dataset and provide 4-6 key "
        f"insights with specific numbers. Be concise.\n\n{context}"
    )

    response = _client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        temperature=0.2,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.choices[0].message.content
