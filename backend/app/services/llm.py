"""LLM integration service supporting multiple providers."""

from __future__ import annotations

import json
import os
from typing import Any


def get_llm_provider() -> str:
    """Get configured LLM provider from environment."""
    return os.getenv("LLM_PROVIDER", "groq").lower()


def get_llm_api_key() -> str:
    """Get API key for the configured LLM provider."""
    provider = get_llm_provider()
    
    if provider == "gemini":
        api_key = os.getenv("GEMINI_API_KEY", "").strip()
        if not api_key:
            raise ValueError("GEMINI_API_KEY not configured in environment")
        return api_key
    
    elif provider == "groq":
        api_key = os.getenv("GROQ_API_KEY", "").strip()
        if not api_key:
            raise ValueError("GROQ_API_KEY not configured in environment")
        return api_key
    
    elif provider == "openai":
        api_key = os.getenv("OPENAI_API_KEY", "").strip()
        if not api_key:
            raise ValueError("OPENAI_API_KEY not configured in environment")
        return api_key
    
    elif provider == "anthropic":
        api_key = os.getenv("ANTHROPIC_API_KEY", "").strip()
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY not configured in environment")
        return api_key
    
    raise ValueError(f"Unknown LLM provider: {provider}")


def answer_question_with_llm(
    question: str,
    dataset_context: dict[str, Any],
) -> dict[str, Any]:
    """Answer a question about a dataset using the configured LLM provider.
    
    Args:
        question: The user's question
        dataset_context: Dictionary with dataset info (columns, sample rows, stats)
        
    Returns:
        Dictionary with answer and metadata
    """
    try:
        provider = get_llm_provider()
        
        if provider == "gemini":
            return _answer_with_gemini(question, dataset_context)
        elif provider == "groq":
            return _answer_with_groq(question, dataset_context)
        elif provider == "openai":
            return _answer_with_openai(question, dataset_context)
        elif provider == "anthropic":
            return _answer_with_anthropic(question, dataset_context)
        else:
            return {"error": f"Unknown LLM provider: {provider}"}
    
    except Exception as e:
        return {
            "error": f"LLM Error: {str(e)}",
            "answer": "Could not answer this question. Please try a different question.",
        }


def _answer_with_gemini(question: str, dataset_context: dict[str, Any]) -> dict[str, Any]:
    """Answer using Google Gemini API."""
    try:
        import google.generativeai as genai
        
        api_key = get_llm_api_key()
        model_name = os.getenv("LLM_MODEL", "gemini-2.0-flash")
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(model_name)
        
        context_text = _build_context_prompt(dataset_context)
        response = model.generate_content(
            f"""{context_text}

User Question: {question}

Please provide a clear, data-driven answer to this question based on the dataset context above. 
If you cannot answer with the available data, explain why.
Keep your answer concise and factual."""
        )
        
        answer_text = response.text if response else "Could not generate answer"
        
        return {
            "answer": answer_text,
            "model": model_name,
            "provider": "gemini",
            "methodology": "Generated using Google Gemini LLM with dataset context",
        }
    except Exception as e:
        raise e


def _answer_with_groq(question: str, dataset_context: dict[str, Any]) -> dict[str, Any]:
    """Answer using Groq API."""
    try:
        from groq import Groq
        
        api_key = get_llm_api_key()
        model_name = os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")
        
        client = Groq(api_key=api_key)
        context_text = _build_context_prompt(dataset_context)
        
        message = client.chat.completions.create(
            model=model_name,
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert data analyst answering questions about datasets. Provide clear, data-driven answers based on the context provided."
                },
                {
                    "role": "user",
                    "content": f"""{context_text}

User Question: {question}

Please provide a clear, data-driven answer to this question based on the dataset context above. 
If you cannot answer with the available data, explain why.
Keep your answer concise and factual."""
                }
            ],
            temperature=0.7,
            max_tokens=1024,
        )
        
        answer_text = message.choices[0].message.content if message.choices else "Could not generate answer"
        
        return {
            "answer": answer_text,
            "model": model_name,
            "provider": "groq",
            "methodology": "Generated using Groq API with dataset context",
        }
    except Exception as e:
        raise e


def _answer_with_openai(question: str, dataset_context: dict[str, Any]) -> dict[str, Any]:
    """Answer using OpenAI API."""
    try:
        from openai import OpenAI
        
        api_key = get_llm_api_key()
        model_name = os.getenv("LLM_MODEL", "gpt-4o-mini")
        
        client = OpenAI(api_key=api_key)
        context_text = _build_context_prompt(dataset_context)
        
        message = client.chat.completions.create(
            model=model_name,
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert data analyst answering questions about datasets. Provide clear, data-driven answers based on the context provided."
                },
                {
                    "role": "user",
                    "content": f"""{context_text}

User Question: {question}

Please provide a clear, data-driven answer to this question based on the dataset context above. 
If you cannot answer with the available data, explain why.
Keep your answer concise and factual."""
                }
            ],
            temperature=0.7,
            max_tokens=1024,
        )
        
        answer_text = message.choices[0].message.content if message.choices else "Could not generate answer"
        
        return {
            "answer": answer_text,
            "model": model_name,
            "provider": "openai",
            "methodology": "Generated using OpenAI API with dataset context",
        }
    except Exception as e:
        raise e


def _answer_with_anthropic(question: str, dataset_context: dict[str, Any]) -> dict[str, Any]:
    """Answer using Anthropic Claude API."""
    try:
        import anthropic
        
        api_key = get_llm_api_key()
        model_name = os.getenv("LLM_MODEL", "claude-3-5-sonnet-20241022")
        
        client = anthropic.Anthropic(api_key=api_key)
        context_text = _build_context_prompt(dataset_context)
        
        message = client.messages.create(
            model=model_name,
            max_tokens=1024,
            system="You are an expert data analyst answering questions about datasets. Provide clear, data-driven answers based on the context provided.",
            messages=[
                {
                    "role": "user",
                    "content": f"""{context_text}

User Question: {question}

Please provide a clear, data-driven answer to this question based on the dataset context above. 
If you cannot answer with the available data, explain why.
Keep your answer concise and factual."""
                }
            ],
        )
        
        answer_text = message.content[0].text if message.content else "Could not generate answer"
        
        return {
            "answer": answer_text,
            "model": model_name,
            "provider": "anthropic",
            "methodology": "Generated using Anthropic Claude API with dataset context",
        }
    except Exception as e:
        raise e


def _build_context_prompt(dataset_context: dict[str, Any]) -> str:
    """Build a context prompt from dataset information.
    
    Args:
        dataset_context: Dictionary with dataset info
        
    Returns:
        Formatted context string for the LLM
    """
    parts = [
        "You are an expert data analyst answering questions about a dataset.",
        "",
        "Dataset Information:",
        f"- Filename: {dataset_context.get('filename', 'unknown')}",
        f"- Total Rows: {dataset_context.get('row_count', 'unknown')}",
        f"- Total Columns: {dataset_context.get('column_count', 'unknown')}",
        "",
        "Column Names:",
    ]
    
    columns = dataset_context.get("column_names", [])
    for col in columns:
        parts.append(f"  - {col}")
    
    # Add sample data
    sample_rows = dataset_context.get("sample_rows", [])
    if sample_rows:
        parts.append("")
        parts.append("Sample Data (first 5 rows):")
        for i, row in enumerate(sample_rows[:5], 1):
            parts.append(f"  Row {i}: {json.dumps(row, default=str)}")
    
    # Add statistics
    stats = dataset_context.get("statistics", {})
    if stats:
        parts.append("")
        parts.append("Dataset Statistics:")
        for key, value in stats.items():
            parts.append(f"  - {key}: {value}")
    
    return "\n".join(parts)
