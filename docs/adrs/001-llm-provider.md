# ADR 001: LLM Provider Decision

## Status

Accepted

## Context

DataLens includes a conversational analytics interface and an executive summary feature. For the Hotel Booking Demand dataset, the chat interface must answer questions about cancellation rates, source markets, lead time, ADR by month, and repeat guest rates with supporting numbers and reproducible tool calls.

The application must also remain generic for any uploaded CSV. Dataset-specific Hotel Booking tools should be available when the expected hotel columns are present, while generic profiling and summary behavior should still work for other CSV files.

During initial planning, Gemini was the anticipated default provider due to its free-tier availability and function-calling support. After evaluating all options during implementation, we switched the active default to Groq.

## Options Considered

- **Gemini:** Accessible through Google AI Studio, supports tool/function calling. Good free-tier option but response latency was higher than needed for interactive chat.
- **Anthropic:** Strong reasoning and chat quality, but requires a paid account and is better suited as an optional provider rather than the primary implementation target.
- **OpenAI:** Strong tool-calling ecosystem and broad model availability, but not required as the first implementation target and has no free tier.
- **Groq:** Extremely fast inference on open-weight models (llama-3.3-70b-versatile). Free tier available. Tool/function-calling is supported. Ideal for an interactive chat interface where response latency directly impacts user experience.

## Decision

Use **Groq with `llama-3.3-70b-versatile`** as the active LLM provider. The environment is configured as `LLM_PROVIDER=groq` with `GROQ_API_KEY` set.

The architecture remains provider-flexible — Gemini, Anthropic, and OpenAI can be enabled by changing `LLM_PROVIDER` in `.env` without any code changes, as all providers are implemented behind the same interface.

## Trade-offs

- Groq's inference speed makes the chat interface feel responsive, which is critical for an interactive analytics tool where users ask follow-up questions in sequence.
- The Groq tool-calling schema differs from OpenAI's format. We had to verify the correct schema against Groq's documentation after the agent initially generated OpenAI-compatible syntax by mistake.
- A pluggable provider layer adds some upfront complexity, but it reduces the cost of switching providers if rate limits, model quality, or availability changes.
- Groq's free tier has rate limits that may be hit under heavy demo use. If this becomes an issue, the fallback is Gemini.

## Consequences

- Default environment configuration uses `LLM_PROVIDER=groq` and `LLM_MODEL=llama-3.3-70b-versatile`.
- Tests mock the LLM provider so Hotel Booking analytics calculations can be verified deterministically without live API calls.
- Chat and executive summary features call backend analytics and profiling tools for grounded answers rather than relying on the model to infer numbers from raw CSV text.
- Future providers must implement the same chat, tool-calling, and summary contract before they can be used interchangeably in DataLens.
