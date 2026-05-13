# Final Project Report

---

## Team

- **Member 1:** Affan Abdul Rahim Khan
- **Member 2:** Haseeb Ahsan
- **Member 3:** Hassaan bin Kamran
- **Assigned Dataset:** Dataset 10 — Hotel Booking Demand
- **Coding Agent Used:** Claude Code
- **LLM Used in the App:** Groq (llama-3.3-70b-versatile)

---

## 1. What the Agent Did Well

### UI Redesign Output
When we asked the agent to redesign the frontend dashboard, it produced a significantly more polished result than we expected. Without being asked for specifics, it reorganized the component hierarchy, applied a consistent color scheme across all chart components, added loading skeletons, and improved spacing throughout. The result was something that looked like a professionally designed product — not a student project. We had only given it a rough direction ("make the UI cleaner"), and it inferred the correct scope on its own. This saved us at least a full day of back-and-forth on visual design.

### Executive Summary Improvement Without Being Asked
After we asked the agent to implement the executive summary feature, it returned not just the basic narrative text but also a structured `key_findings` array in the API response — a field we had not requested. It recognized from the spec that a business-analyst-style summary should be scannable, not just a paragraph of prose. The frontend then displayed these findings as bullet-point cards. This decision improved UX meaningfully and aligned exactly with what the spec described as "actionable insights." We did not have to ask for it — the agent read the spec carefully and delivered it.

### Tool-Calling Pattern Implementation
When we asked for the LLM chat interface, the agent automatically set up the full tool-calling pattern: it defined Pydantic schemas for each analytics function, registered them as tools with the Groq API, wrote a dispatch layer to invoke the correct function based on the LLM's response, and handled the tool-result loop. None of this orchestration was explicitly described in our prompt — only the end goal was stated. The implementation was correct on the first attempt and became the backbone of the entire chat feature.

---

## 2. Where We Had to Intervene

### Agent Tried to Hardcode Dataset-Specific Assumptions
Early in Week 2, when implementing the chart recommendation engine, the agent began hardcoding column names from the Hotel Booking dataset (e.g., checking for `hotel`, `reservation_status`, `adr` by name) directly in the generic `recommend_charts()` function. This was wrong because the spec explicitly requires the app to work with **any** CSV. When we caught this, we redirected the agent: "The chart recommendation logic must not reference Hotel Booking column names. It should use only detected column types from the profile." The agent rewrote the function to be fully type-driven. The lesson: the agent will always solve the specific problem in front of it — you have to keep reminding it of the generality constraint.

### Agent Wanted to Skip Writing Tests First
On multiple occasions the agent suggested implementing the feature first and "adding tests after." This is the classic anti-rationalization the spec warned us about. In one specific case, when building the data cleaning pipeline, the agent said: "I'll implement the cleaning rules now and write tests once we can verify the output manually." We pushed back each time: "Write the test file first with the expected inputs and outputs, then implement." This cost a few extra minutes per feature but caught two subtle bugs in the month-ordering logic that would have been hard to find later.

### Agent Hallucinated Function Signatures and API Responses
The agent hallucinated several times when working with the Groq API's tool-calling format. It confidently generated function-calling syntax that matched OpenAI's format, not Groq's. The resulting code failed silently — the LLM received the tools but never invoked them. We had to intervene, pull up the actual Groq documentation, and paste the correct tool schema format into the prompt. After correction, the agent rewrote the integration correctly. The lesson: whenever the agent works with a third-party API, verify the output against the actual documentation — never assume it has the current spec memorized.

### Agent Over-Engineered the Filter State
When implementing global filters, the agent proposed a full Redux store with middleware, reducers, and selectors. This was overkill for our scope. We redirected it: "Use React Context with a single `useFilters` hook. We don't need Redux — the app has one page and the filter state is not shared across routes." The agent produced a much simpler and more maintainable solution. This also matched the spirit of our spec, which emphasized keeping the MVP lean.

---

## 3. Which Skills Activated When

### spec-driven-development
On Day 3, when we said "let's figure out what we're building," the agent immediately produced a structured SPEC.md with six sections — Objective, Commands, Project Structure, Code Style, Testing Strategy, and Boundaries. It surfaced assumptions we hadn't considered, such as: "Do we support Excel files in addition to CSV?" and "Should data persist across browser sessions, or only during the current session?" These questions forced us to make decisions early that would have caused rework if left unanswered. The spec became the reference document we checked against every time the agent produced something unexpected.

### planning-and-task-breakdown
After the spec was approved, the agent produced `tasks/plan.md` and `tasks/todo.md` with 24 tasks, each scoped to roughly 5 files. When we reviewed them, we noticed a few tasks were too large — for example, "implement LLM chat and tool-calling" was originally one task. We asked the agent to break it into three: analytics functions, backend integration, and frontend component. The agent complied and the resulting breakdown matched the thin-slice discipline the spec required.

### incremental-implementation
The agent consistently proposed committing after each working vertical slice. When we completed the CSV upload endpoint, it committed only those files before touching the profiling service. This discipline kept the git history readable and meant we always had a working baseline to roll back to. On Day 10, a filter implementation broke the chart rendering — because we had atomic commits, we could identify exactly which change introduced the regression within two minutes.

### test-driven-development
After our early pushback on skipping tests, the agent adopted a consistent pattern: write the test file with expected inputs and outputs, then implement. For the hotel analytics functions (cancellation rate, ADR by month, etc.), it wrote fixture CSV data first, defined the expected output values, and only then implemented the calculation logic. This made debugging straightforward — when a calculation was wrong, the failing test told us exactly which function and what the expected vs. actual difference was.

### documentation-and-adrs
When we made the decision to switch the default LLM provider from Gemini to Groq (for speed and free-tier availability), the agent automatically suggested writing an ADR. It produced a draft covering Context, Options Considered, Decision, and Trade-offs without us asking. We reviewed and approved it. The same happened when we chose Recharts over Plotly — the agent flagged it as an architectural decision worth documenting. This meant our ADRs reflected real decisions as they happened, not reconstructed after the fact.

### git-workflow-and-versioning
The agent proposed a descriptive commit message for every task: `feat:`, `test:`, `docs:`, `fix:` prefixes were used consistently. When we accidentally made a large commit mid-week, the agent suggested splitting it using `git add -p` to stage changes file by file. The resulting history is readable and shows genuine work spread across three weeks, which was important for the grading rubric.

---

## 4. What We Would Do Differently

- **Start the report earlier.** We kept notes throughout, but writing the actual report under time pressure meant we had to reconstruct some details from memory. Running notes in a shared doc from Day 1 would have made this section much easier.
- **Dry-run the README setup on Day 15, not Day 20.** We caught a missing environment variable in `.env.example` during the final dry-run. Catching it earlier would have been less stressful.
- **Be more aggressive about pushing back on over-engineering.** The filter Redux detour cost us half a day. We should have stated the simplicity constraint in the spec so the agent had it as a boundary, not something we corrected reactively.
- **Write more granular acceptance criteria.** Several tasks had vague criteria like "charts render correctly." More specific criteria — "each chart renders within 2 seconds with the hotel dataset loaded" — would have made verification faster and caught performance issues earlier.

---

## 5. Key Lessons for Future Projects

- **Spec first genuinely pays off.** The spec felt like overhead on Days 3–5. By Day 10, it was the single most valuable artifact we had — every time the agent produced something questionable, we could check it against the spec.
- **The agent will rationalize shortcuts — you have to actively catch them.** "I'll add tests later," "this edge case is unlikely," "this is simple enough to hardcode" — these phrases are signals to push back, every time.
- **Hallucination is most dangerous when the agent sounds most confident.** The Groq API schema error came with no warning. The agent wrote incorrect code fluently. The fix was always the same: go to the actual documentation and verify.
- **Small commits are better for both you and the agent.** When something breaks, a clean git history means you know exactly where to look. Debugging with a single Day-20 mega-commit would have been extremely painful.
- **The agent is a collaborator, not an oracle.** Treat its output as a draft from a fast junior engineer — impressive but requiring review. The review is your job.

---

## 6. Time Spent (approximate)

| Activity | Hours |
|----------|-------|
| Reading docs, setting up | 5 |
| Spec writing | 8 |
| Planning and task breakdown | 5 |
| Implementation | 38 |
| Debugging | 14 |
| Documentation and ADRs | 6 |
| This report | 3 |
| **Total per person** | **~79** |

---

## 7. Acknowledgments

We used the Agent Skills framework developed by Addy Osmani (https://github.com/addyosmani/agent-skills, MIT License). The six mandatory skills in `.agent/skills/` are unmodified copies of his SKILL.md files.

Special thanks to our course instructors for a project structure that forced genuine software discipline — the spec-first gated workflow felt restrictive at first and invaluable by Week 3.

---

*Report version: 1.0 | Last updated: May 14, 2026*
