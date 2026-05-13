"""Chat endpoint for data-grounded questions."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from backend.app.db.storage import get_dataset
from backend.app.services.chat_tools import answer_hotel_booking_question
from backend.app.services.llm import answer_question_with_llm, get_llm_provider

router = APIRouter()


class ChatRequest(BaseModel):
    """Request body for chat endpoint."""

    dataset_id: str
    question: str


class ChatResponse(BaseModel):
    """Response from chat endpoint."""

    dataset_id: str
    question: str
    answer: str
    data: dict[str, Any]


def _is_hotel_booking_dataset(dataset: dict[str, Any]) -> bool:
    """Return True if the dataset looks like the Hotel Booking Demand dataset."""
    col_names = [c.lower() for c in dataset.get("column_names", [])]
    return "is_canceled" in col_names and "hotel" in col_names and "adr" in col_names


def _build_dataset_context(dataset_id: str) -> dict[str, Any]:
    """Build dataset context for LLM fallback.

    Args:
        dataset_id: The dataset ID

    Returns:
        Dictionary with dataset context (columns, sample rows, stats)
    """
    dataset = get_dataset(dataset_id)
    if not dataset:
        return {}

    rows = dataset.get("rows", [])

    return {
        "filename": dataset.get("filename", "unknown"),
        "row_count": len(rows),
        "column_count": dataset.get("column_count", 0),
        "column_names": dataset.get("column_names", []),
        "sample_rows": rows[:5],
        "statistics": {
            "total_rows": len(rows),
            "total_columns": dataset.get("column_count", 0),
        },
    }


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """Answer a data-grounded question about a dataset.

    For Hotel Booking datasets the request is first routed through the
    deterministic tool dispatcher (answer_hotel_booking_question) which
    queries the full dataset and returns precise numeric answers.  For
    all other datasets, or when the tool dispatcher cannot match the
    question, the request falls back to the configured LLM provider with
    dataset context.

    Args:
        request: ChatRequest with dataset_id and question

    Returns:
        ChatResponse with answer and data
    """
    # Validate dataset exists
    dataset = get_dataset(request.dataset_id)
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset {request.dataset_id} not found",
        )

    # ── Hotel Booking: try deterministic tool dispatcher first ──────────
    if _is_hotel_booking_dataset(dataset):
        tool_result = answer_hotel_booking_question(request.dataset_id, request.question)
        if "error" not in tool_result:
            answer = tool_result.pop("answer", "")
            return ChatResponse(
                dataset_id=request.dataset_id,
                question=request.question,
                answer=answer,
                data=tool_result,
            )

    # ── Generic fallback: send to LLM with dataset context ──────────────
    context = _build_dataset_context(request.dataset_id)
    result = answer_question_with_llm(request.question, context)

    if "error" in result and "answer" not in result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Could not answer this question"),
        )

    answer = result.pop("answer", "")
    return ChatResponse(
        dataset_id=request.dataset_id,
        question=request.question,
        answer=answer,
        data=result,
    )
