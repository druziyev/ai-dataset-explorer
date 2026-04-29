"""AI service — LangChain agent with streaming for data Q&A."""

import asyncio
import threading
from typing import AsyncGenerator

import pandas as pd
from langchain.callbacks.base import BaseCallbackHandler
from langchain_openai import ChatOpenAI
from langchain_experimental.agents import create_pandas_dataframe_agent

from config import settings


class QueueCallbackHandler(BaseCallbackHandler):
    """Callback handler that puts LLM tokens into an asyncio queue."""

    def __init__(self, queue: asyncio.Queue, loop: asyncio.AbstractEventLoop):
        self.queue = queue
        self.loop = loop

    def on_llm_new_token(self, token: str, **kwargs) -> None:
        asyncio.run_coroutine_threadsafe(self.queue.put(token), self.loop)


def _build_agent(df: pd.DataFrame, callback_handler: QueueCallbackHandler):
    """Create a LangChain pandas DataFrame agent."""
    llm = ChatOpenAI(
        model=settings.OPENAI_MODEL,
        temperature=0,
        streaming=True,
        openai_api_key=settings.OPENAI_API_KEY,
        callbacks=[callback_handler],
    )

    agent = create_pandas_dataframe_agent(
        llm,
        df,
        agent_type="openai-tools",
        verbose=False,
        allow_dangerous_code=True,
        prefix=(
            "You are an expert data analyst. You have access to a pandas DataFrame called `df`. "
            "When answering questions, always provide specific numbers, statistics, and insights. "
            "Be concise but thorough. If the user asks for analysis, run the code and explain "
            "the results clearly. Use markdown formatting in your answers when helpful."
        ),
    )
    return agent


async def stream_agent_response(
    df: pd.DataFrame, message: str
) -> AsyncGenerator[str, None]:
    """Stream tokens from the LangChain agent as an async generator."""
    loop = asyncio.get_event_loop()
    queue: asyncio.Queue = asyncio.Queue()
    handler = QueueCallbackHandler(queue, loop)

    agent = _build_agent(df, handler)

    def run_agent():
        try:
            agent.invoke({"input": message})
        except Exception as e:
            asyncio.run_coroutine_threadsafe(
                queue.put(f"\n\n⚠️ Error: {str(e)}"), loop
            )
        finally:
            asyncio.run_coroutine_threadsafe(queue.put(None), loop)

    thread = threading.Thread(target=run_agent, daemon=True)
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
    llm = ChatOpenAI(
        model=settings.OPENAI_MODEL,
        temperature=0.2,
        openai_api_key=settings.OPENAI_API_KEY,
    )

    # Build a concise data summary for context
    desc = df.describe(include="all").to_string()
    shape = f"{df.shape[0]} rows × {df.shape[1]} columns"
    cols = ", ".join(df.columns.tolist()[:30])
    sample = df.head(5).to_string()
    missing = df.isnull().sum()
    missing_str = missing[missing > 0].to_string() if missing.any() else "No missing values"

    prompt = (
        f"You are an expert data analyst. Analyze this dataset and provide 4-6 key insights "
        f"with specific numbers. Be concise.\n\n"
        f"Shape: {shape}\nColumns: {cols}\n\n"
        f"Statistics:\n{desc}\n\n"
        f"Missing values:\n{missing_str}\n\n"
        f"Sample rows:\n{sample}"
    )

    response = llm.invoke(prompt)
    return response.content
