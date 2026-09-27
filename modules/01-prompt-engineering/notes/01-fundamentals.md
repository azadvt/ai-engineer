# Prompt Engineering Fundamentals

> Module 01 - Phase 1: Foundations - Estimated reading: ~25 min
> Prerequisites: None

---

## CONCEPT -- What You Need to Know

### Beginner: The Art of Asking AI the Right Question

#### What Prompt Engineering Actually Is

Think of it this way: you have access to a brilliant assistant who has read most of the internet, can write code in dozens of languages, can reason through complex problems, and can produce polished prose in seconds. But this assistant is literal-minded. It does exactly what you ask -- not what you meant. If your instructions are vague, it will fill the gaps with its best guess. If your instructions are precise, it will follow them with remarkable fidelity.

Prompt engineering is the discipline of crafting those instructions so the model consistently produces the output you need. It is not about tricking the model or exploiting loopholes. It is about clear communication with a system that processes language differently than a human would.

The analogy that holds up best: briefing a brilliant but literal-minded new hire. If you tell them "write a report," you will get something. It might even be good. But if you tell them "write a two-page executive summary of Q3 performance for the CFO, focusing on revenue variance against forecast, using bullet points, with a recommendation section at the end," you will get exactly what you need.

That gap between "write a report" and the detailed brief is where prompt engineering lives.

#### Why It Matters More Than You Think

The same model, with the same weights, at the same temperature, can produce outputs that range from useless to extraordinary depending solely on the prompt. This is not a marginal effect. Consider:

- A poorly prompted GPT-4 can produce worse results than a well-prompted GPT-3.5.
- A well-structured prompt can eliminate entire categories of errors (wrong format, missing fields, hallucinated data) without any code changes.
- In production systems, the prompt is often the most impactful and least version-controlled component.

Prompt engineering is also the first tool you should reach for. Before you fine-tune, before you build a RAG pipeline, before you train a custom model -- try writing a better prompt. It costs nothing, deploys instantly, and works across every model.

#### Key Terms

| Term | Definition | Why It Matters |
|------|-----------|----------------|
| **Prompt** | The full text input sent to the model | Everything the model sees. This is your only lever. |
| **System Prompt** | A special instruction block that sets the model's behavior, role, and constraints | Persists across a conversation. Sets the "rules of engagement." Not all APIs expose this. |
| **User Prompt** | The actual request or question from the end user | What changes per request. The variable part. |
| **Completion** | The model's generated response | What you get back. Also called the "response" or "output." |
| **Tokens** | Sub-word units the model reads and writes (~4 characters per token in English) | You pay per token. Prompt tokens + completion tokens = total cost. Also determines if you fit in the context window. |
| **Temperature** | Controls randomness in token selection (0 = deterministic, higher = more random) | Low for factual/structured tasks, higher for creative tasks. Typical range: 0.0 to 1.0. |
| **Top-p (nucleus sampling)** | Limits token selection to the smallest set whose cumulative probability exceeds p | An alternative to temperature for controlling randomness. Usually you set one or the other, not both. |
| **Stop Sequences** | Strings that tell the model to stop generating when encountered | Critical for structured output. Prevents the model from rambling past the answer boundary. |
| **Context Window** | Maximum number of tokens (prompt + completion) the model can process | Hard ceiling. If your prompt + expected output exceeds this, you must truncate or restructure. |

#### The Anatomy of a Good Prompt

Every effective prompt, whether it is two lines or two pages, draws from five components. Not every prompt needs all five, but knowing them lets you diagnose why a prompt is failing.

**1. Role** -- Who the model should be.
Setting a role activates relevant knowledge and adjusts tone. "You are a senior Python developer" produces different code review feedback than "You are a technical writer."

**2. Context** -- What background information the model needs.
The model only knows what you put in the prompt (plus its training data). If your task requires specific context -- a document, prior conversation, constraints from a product spec -- it must be in the prompt.

**3. Task** -- What the model should do.
This is the actual instruction. Be specific. "Summarize" is weaker than "Summarize in 3 bullet points, each under 20 words, focusing on actionable takeaways."

**4. Format** -- How the output should be structured.
JSON, markdown table, numbered list, XML, plain prose -- specify it. Models are remarkably good at following format instructions when you give them.

**5. Constraints** -- What the model should NOT do.
Boundaries matter as much as instructions. "Do not include information not present in the provided context." "Respond only in valid JSON." "If you are unsure, say so rather than guessing."

Here is a prompt that uses all five:

```
You are an experienced data analyst. [ROLE]

Given the following quarterly sales data: [CONTEXT]
Q1: $1.2M, Q2: $1.8M, Q3: $1.1M, Q4: $2.3M

Identify the quarter with the largest quarter-over-quarter change [TASK]
and explain the likely contributing factors.

Respond in this format: [FORMAT]
Quarter: <quarter>
Change: <percentage change>
Analysis: <2-3 sentences>

Base your analysis only on the data provided. [CONSTRAINTS]
Do not reference external economic factors.
```

#### Common Prompt Patterns

These are the foundational patterns that most production prompts are built from. Think of them as design patterns in software engineering -- recurring solutions to recurring problems.

**1. Direct Instruction**
The simplest pattern. Tell the model what to do. Works surprisingly well for straightforward tasks.
```
Translate the following English text to French. Preserve the original formatting.

Text: "The quarterly report is due by Friday. Please include year-over-year comparisons."
```

**2. Role-Play (Persona)**
Assign the model an identity. This is not theatrical -- it genuinely shifts the model's output distribution toward the expertise associated with that role.
```
You are a database administrator with 15 years of experience in PostgreSQL performance tuning.

A developer reports that their query takes 12 seconds. Here is the query:
SELECT * FROM orders JOIN customers ON orders.customer_id = customers.id WHERE orders.created_at > '2024-01-01';

Diagnose the likely performance issues and suggest specific fixes.
```

**3. Step-by-Step (Chain of Thought)**
Ask the model to reason through the problem before giving the answer. This genuinely improves accuracy on tasks that require multi-step reasoning -- math, logic, analysis, debugging.
```
Determine whether the following argument is logically valid.
Think through this step by step before giving your final answer.

Premise 1: All managers attend the Monday meeting.
Premise 2: Sarah did not attend the Monday meeting.
Conclusion: Sarah is not a manager.
```

**4. Few-Shot (Examples)**
Show the model what you want by giving it examples of input-output pairs. This is one of the most powerful patterns because it lets you define behavior through demonstration rather than description.
```
Classify the following customer messages by intent.

Examples:
Message: "I can't log into my account" -> Intent: account_access
Message: "When will my order arrive?" -> Intent: order_status
Message: "I'd like a refund for my last purchase" -> Intent: refund_request

Now classify:
Message: "My password reset email never arrived"
```

**5. Output Anchoring**
Start the model's response for it. By providing the beginning of the output, you constrain the format and content of what follows.
```
Analyze the following code for security vulnerabilities.

Code:
<code block here>

Analysis:
1. Vulnerability:
```

The model will continue from "1. Vulnerability:" and naturally produce a numbered list of findings in that format.

---

### Advanced: Prompt Architecture Patterns

#### Structured Prompt Formats

As prompts grow in complexity -- and in production systems, they always do -- you need structure to keep them maintainable and unambiguous. The model needs clear boundaries between sections. Humans maintaining the prompts need readability.

**XML Tags**
XML tags are the most reliable delimiters across models. They are unambiguous, nestable, and models have seen enormous amounts of XML in training data. Claude in particular responds very well to XML-structured prompts.

```
<system>
You are a legal document reviewer specializing in contract analysis.
</system>

<context>
<document type="contract" parties="Acme Corp, Widget Inc">
{{contract_text}}
</document>
</context>

<task>
Review the contract above and identify:
1. Termination clauses and their conditions
2. Liability limitations
3. Any unusual or potentially problematic provisions
</task>

<output_format>
Respond in JSON with this structure:
{
  "termination_clauses": [...],
  "liability_limitations": [...],
  "flagged_provisions": [...]
}
</output_format>
```

**Markdown Sections**
Markdown headings and formatting work well, especially with models that have heavy markdown exposure in training (most do). Good for human readability.

```
# Role
Senior code reviewer for a Python backend team.

# Context
The following pull request changes the authentication middleware.

# Code
```python
{code_diff}
`` `

# Task
Review for: security issues, performance concerns, readability.
Provide line-specific comments where applicable.
```

**Delimiters**
Triple backticks, triple dashes, triple quotes -- any consistent delimiter that separates data from instructions. The key is consistency. Pick one convention and stick with it.

```
Summarize the following article in exactly 3 bullet points.

---
{{article_text}}
---

Each bullet point should be one sentence, under 25 words.
```

#### Prompt Composition Patterns

**Chain Prompts**
Break a complex task into a sequence of simpler prompts, where each step's output feeds into the next step's input. This is more reliable than asking the model to do everything at once because each step is focused and easier to validate.

Example flow for generating a technical blog post:
1. Prompt 1: "Given this topic, generate an outline with 5 sections."
2. Prompt 2: "Given this outline, write section 1. Here is the outline: {outline}"
3. Prompt 3: "Given sections 1-4, write a conclusion that ties them together."
4. Prompt 4: "Review the full post for technical accuracy and consistency."

Each step can use a different temperature, a different system prompt, or even a different model.

**Template Systems**
Parameterized prompts with variable slots. This is how production systems work -- you do not write a new prompt for every request. You write a template once, validate it thoroughly, and fill in the variables at runtime.

```
You are a {{role}} helping a {{audience}}.

The user's question is:
{{user_question}}

Relevant context from our knowledge base:
{{retrieved_context}}

Respond in {{language}}. Keep your answer under {{max_words}} words.
```

**Meta-Prompting**
Using a model to generate or improve prompts. This sounds circular but is genuinely useful. You can ask a model to analyze a failing prompt, suggest improvements, or generate prompt variations for A/B testing.

#### Temperature and Sampling Parameters Deep-Dive

Temperature is not a creativity dial. It controls the probability distribution over the next token.

At **temperature 0**, the model always picks the highest-probability next token. Output is deterministic (or near-deterministic -- implementation details vary). Use this for: classification, extraction, structured output, factual Q&A, code generation. Anywhere you want consistency and correctness.

At **temperature 0.7**, the probability distribution is softened. Lower-probability tokens get a reasonable chance of being selected. Use this for: creative writing, brainstorming, generating diverse examples. The output will vary between runs.

At **temperature 1.0+**, the distribution flattens significantly. Even low-probability tokens can be selected. The output becomes increasingly random and potentially incoherent. Rarely useful in production.

**Top-p** works differently. Instead of scaling probabilities, it truncates: only tokens whose cumulative probability mass reaches the threshold p are considered. Top-p = 0.9 means the model considers the smallest set of tokens that together have a 90% probability. This adaptively adjusts -- for confident predictions (where one token has 95% probability), it behaves like temperature 0. For uncertain predictions, it allows more variety.

**Practical guidance**: set one or the other, not both. For production, start with temperature 0 and only increase if the output is too rigid or repetitive. If you need controlled variety, top-p = 0.9 with temperature = 1.0 is a common combination.

**Frequency penalty** and **presence penalty** (OpenAI-specific) reduce repetition. Frequency penalty penalizes tokens proportional to how often they have appeared. Presence penalty applies a flat penalty to any token that has appeared at all. Useful for long-form generation where models tend to loop.

#### Token Economics

Every token costs money and adds latency. This has concrete engineering implications:

- **Prompt tokens** are cheaper than **completion tokens** (typically 2-4x cheaper, depending on the provider and model).
- A 2,000-token prompt with a 500-token response costs real money at scale. If you handle 10,000 requests/day on GPT-4, prompt efficiency directly impacts your bill.
- **Latency scales with completion length**, not prompt length. A long prompt with a short response is faster than a short prompt with a long response. This means asking for concise output is not just about cost -- it is about user experience.
- **Context window** is a hard limit. If your system prompt is 1,500 tokens, your RAG context is 3,000 tokens, and the user's message is 500 tokens, you have used 5,000 tokens before the model writes a single word. On a 8K-context model, you have 3,000 tokens left for the response.

**Token counting matters**. Use `tiktoken` (for OpenAI models) or the Anthropic tokenizer to count tokens before sending requests. Do not guess.

```python
import tiktoken

encoder = tiktoken.encoding_for_model("gpt-4")
token_count = len(encoder.encode("Your prompt text here"))
print(f"Token count: {token_count}")
```

#### Prompt-Model Interaction

Different models respond differently to the same prompt. This is not a minor detail -- it is a fundamental design constraint.

**Why models differ:**
- Training data composition. A model trained heavily on code responds differently to code-related prompts than a model trained primarily on prose.
- RLHF/RLAIF tuning. The way a model was fine-tuned for helpfulness, harmlessness, and honesty shapes how it interprets instructions.
- Architecture differences. Token limits, attention mechanisms, and internal representations all vary.
- System prompt conventions. Claude uses XML tags natively. GPT models respond well to markdown. Some open-source models ignore system prompts entirely.

#### Comparison: Prompt Strategies Across Models

| Strategy | Claude (3.5/4) | GPT-4 / GPT-4o | Gemini 1.5/2.0 | Open-Source (Llama, Mistral) |
|----------|---------------|-----------------|-----------------|------------------------------|
| **XML-structured prompts** | Excellent. Natively trained on XML delimiters. Recommended approach. | Good. Follows XML structure but does not benefit from special training on it. | Good. Handles XML but no special affinity. | Variable. Some models ignore XML tags or treat them as literal text. |
| **System prompt** | Strong adherence. Treats system prompt as persistent behavioral instructions. | Strong adherence. Well-separated from user content. | Supported but sometimes blends with user prompt behavior. | Depends heavily on the chat template. Some models require specific formatting (e.g., `[INST]` tags for Llama). |
| **Chain of thought** | Very effective. Responds well to "think step by step" and produces genuine reasoning traces. | Very effective. Can also use structured CoT with numbered steps. | Effective, especially with explicit step instructions. | Varies by model size. Smaller models (<13B) often produce shallow reasoning chains. |
| **Few-shot examples** | Strong pattern matching from examples. 3-5 examples typically sufficient. | Strong. Can generalize from fewer examples than most models. | Strong with well-formatted examples. | Needs more examples (5-10) for consistent behavior. Formatting of examples matters more. |
| **JSON output** | Reliable when explicitly requested. Benefits from showing the exact schema. | Excellent, especially with JSON mode / structured outputs API. | Good with explicit schema. | Inconsistent without fine-tuning. Often produces invalid JSON with extra text. |
| **Temperature sensitivity** | Smooth scaling. Temp 0 is very deterministic. | Similar smooth scaling. | Can be more volatile at mid-range temperatures. | Highly model-dependent. Some models are already quite random at temp 0.5. |
| **Long prompt handling** | 200K context. Handles long prompts well with minimal degradation. | 128K context (GPT-4o). Good but can exhibit "lost in the middle" effect. | Up to 1M+ tokens (Gemini 1.5 Pro). Best raw context length. | Typically 4K-32K. Severe degradation beyond trained context length. |

The practical takeaway: do not assume a prompt that works on one model will work on another. When you switch models, re-test your prompts.

---

## BUILD -- Hands-On Code

### Quick Example: Same Question, Different Prompts

This demonstrates the core insight of prompt engineering -- the prompt matters more than you think. The same model, the same question, dramatically different results.

```python
"""
Prompt Engineering: Quick comparison of basic vs structured prompts.
Requires: pip install openai
Set OPENAI_API_KEY in your environment.
"""
from openai import OpenAI

client = OpenAI()

question = "What causes a Python memory leak?"

# --- Basic prompt: vague, no structure ---
basic_response = client.chat.completions.create(
    model="gpt-4o",
    temperature=0,
    messages=[{"role": "user", "content": question}],
)

# --- Structured prompt: role, format, constraints ---
structured_response = client.chat.completions.create(
    model="gpt-4o",
    temperature=0,
    messages=[
        {
            "role": "system",
            "content": (
                "You are a senior Python engineer explaining concepts to a "
                "mid-level developer. Be specific and practical. Always include "
                "a concrete code example. Keep your response under 200 words."
            ),
        },
        {
            "role": "user",
            "content": (
                "What are the top 3 causes of memory leaks in Python?\n\n"
                "For each cause, provide:\n"
                "- A one-sentence explanation\n"
                "- A 2-3 line code snippet showing the mistake\n"
                "- The fix in one sentence"
            ),
        },
    ],
)

print("=== BASIC PROMPT ===")
print(basic_response.choices[0].message.content)
print("\n=== STRUCTURED PROMPT ===")
print(structured_response.choices[0].message.content)
```

Run this and compare the outputs. The basic prompt produces a correct but rambling explanation. The structured prompt produces a focused, actionable, consistently formatted answer. Same model, same temperature, same underlying question.

### Full Implementation: Prompt Template System

This is a production-grade prompt template system. It handles variable substitution, validation, system/user prompt composition, and parameter configuration. You would use something like this as the foundation for any application that sends prompts to an LLM.

```python
"""
Prompt Template System
A reusable framework for building, validating, and executing structured prompts.
Requires: pip install openai
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any

from openai import OpenAI


@dataclass
class PromptConfig:
    """Model and sampling configuration for a prompt."""
    model: str = "gpt-4o"
    temperature: float = 0.0
    max_tokens: int = 1024
    top_p: float | None = None
    stop: list[str] | None = None

    def to_api_kwargs(self) -> dict[str, Any]:
        kwargs: dict[str, Any] = {
            "model": self.model,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
        }
        if self.top_p is not None:
            kwargs["top_p"] = self.top_p
        if self.stop is not None:
            kwargs["stop"] = self.stop
        return kwargs


# Pattern to match template variables like {{variable_name}}
_VAR_PATTERN = re.compile(r"\{\{(\w+)\}\}")


@dataclass
class PromptTemplate:
    """
    A prompt template with variable substitution and validation.

    Variables are denoted with double curly braces: {{variable_name}}.
    Both system_template and user_template support variables.
    """
    name: str
    system_template: str
    user_template: str
    config: PromptConfig = field(default_factory=PromptConfig)
    required_variables: set[str] = field(default_factory=set, init=False)

    def __post_init__(self) -> None:
        # Auto-detect required variables from both templates
        sys_vars = set(_VAR_PATTERN.findall(self.system_template))
        usr_vars = set(_VAR_PATTERN.findall(self.user_template))
        self.required_variables = sys_vars | usr_vars

    def validate(self, variables: dict[str, str]) -> list[str]:
        """Check that all required variables are provided. Returns list of errors."""
        errors = []
        missing = self.required_variables - set(variables.keys())
        if missing:
            errors.append(f"Missing variables: {', '.join(sorted(missing))}")
        empty = [k for k in self.required_variables if not variables.get(k, "").strip()]
        if empty:
            errors.append(f"Empty variables: {', '.join(sorted(empty))}")
        return errors

    def render(self, variables: dict[str, str]) -> dict[str, str]:
        """Render the system and user prompts with the given variables."""
        errors = self.validate(variables)
        if errors:
            raise ValueError(f"Template '{self.name}' validation failed: {'; '.join(errors)}")

        def _substitute(template: str) -> str:
            def replacer(match: re.Match) -> str:
                return variables[match.group(1)]
            return _VAR_PATTERN.sub(replacer, template)

        return {
            "system": _substitute(self.system_template),
            "user": _substitute(self.user_template),
        }

    def execute(self, variables: dict[str, str], client: OpenAI | None = None) -> str:
        """Render, send to the API, and return the model's response."""
        if client is None:
            client = OpenAI()
        rendered = self.render(variables)
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": rendered["system"]},
                {"role": "user", "content": rendered["user"]},
            ],
            **self.config.to_api_kwargs(),
        )
        return response.choices[0].message.content


# ---------------------------------------------------------------------------
# Example templates demonstrating four common prompt patterns
# ---------------------------------------------------------------------------

# 1. INSTRUCTION PATTERN -- Direct, task-focused prompt
instruction_template = PromptTemplate(
    name="instruction_summarizer",
    system_template=(
        "You are a precise summarization engine. Produce exactly {{num_points}} "
        "bullet points. Each bullet must be one sentence, under 25 words. "
        "Do not add introductions, conclusions, or commentary."
    ),
    user_template=(
        "Summarize the following text:\n\n"
        "---\n{{source_text}}\n---"
    ),
    config=PromptConfig(temperature=0.0, max_tokens=512),
)

# 2. ROLE-BASED PATTERN -- Persona shapes the response
role_template = PromptTemplate(
    name="role_code_reviewer",
    system_template=(
        "You are a {{seniority}} {{language}} developer performing a code review.\n"
        "Focus on: correctness, readability, performance, and security.\n"
        "For each issue found, state the line or section, the problem, and a fix.\n"
        "If the code is clean, say so and explain why."
    ),
    user_template=(
        "Review the following {{language}} code:\n\n"
        "```{{language}}\n{{code}}\n```"
    ),
    config=PromptConfig(temperature=0.0, max_tokens=1024),
)

# 3. STRUCTURED OUTPUT PATTERN -- Enforces a specific response format
structured_output_template = PromptTemplate(
    name="structured_entity_extractor",
    system_template=(
        "You are a named entity extraction system. Extract entities from the "
        "provided text and return them in valid JSON. No additional text.\n\n"
        "Output schema:\n"
        "{\n"
        '  "persons": ["..."],\n'
        '  "organizations": ["..."],\n'
        '  "locations": ["..."],\n'
        '  "dates": ["..."]\n'
        "}\n\n"
        "If a category has no entities, use an empty list."
    ),
    user_template="Extract entities from:\n\n{{text}}",
    config=PromptConfig(temperature=0.0, max_tokens=512, stop=["\n\n"]),
)

# 4. FEW-SHOT PATTERN -- Teaching by example
few_shot_template = PromptTemplate(
    name="few_shot_classifier",
    system_template=(
        "Classify customer support messages into one of these categories: "
        "billing, technical, account, feedback, other.\n\n"
        "Examples:\n"
        'Message: "I was charged twice this month" -> Category: billing\n'
        'Message: "The app crashes when I open settings" -> Category: technical\n'
        'Message: "I need to update my email address" -> Category: account\n'
        'Message: "I love the new dashboard design" -> Category: feedback\n'
        'Message: "What are your office hours?" -> Category: other\n\n'
        "Respond with only the category name. Nothing else."
    ),
    user_template='Message: "{{message}}"',
    config=PromptConfig(temperature=0.0, max_tokens=10),
)


# ---------------------------------------------------------------------------
# Usage demonstration
# ---------------------------------------------------------------------------

def main() -> None:
    client = OpenAI()

    # --- Instruction pattern ---
    print("=== Instruction Pattern: Summarizer ===")
    result = instruction_template.execute(
        {
            "num_points": "3",
            "source_text": (
                "Machine learning models require large amounts of training data to "
                "generalize well. Data augmentation techniques can artificially expand "
                "training sets by applying transformations like rotation, cropping, and "
                "color adjustment to existing images. This approach has been shown to "
                "improve model accuracy by 10-15% on standard benchmarks while reducing "
                "overfitting, particularly for smaller datasets. However, care must be "
                "taken to ensure augmentations remain realistic and do not introduce "
                "artifacts that could confuse the model."
            ),
        },
        client=client,
    )
    print(result)

    # --- Role-based pattern ---
    print("\n=== Role-Based Pattern: Code Review ===")
    result = role_template.execute(
        {
            "seniority": "senior",
            "language": "python",
            "code": (
                "def get_user(id):\n"
                "    query = f\"SELECT * FROM users WHERE id = {id}\"\n"
                "    result = db.execute(query)\n"
                "    return result[0] if result else None"
            ),
        },
        client=client,
    )
    print(result)

    # --- Structured output pattern ---
    print("\n=== Structured Output Pattern: Entity Extraction ===")
    result = structured_output_template.execute(
        {
            "text": (
                "On March 15, 2024, Sarah Chen met with representatives from "
                "Anthropic and Google DeepMind at their offices in San Francisco "
                "to discuss the upcoming AI safety summit in London."
            ),
        },
        client=client,
    )
    print(result)

    # --- Few-shot pattern ---
    print("\n=== Few-Shot Pattern: Classification ===")
    result = few_shot_template.execute(
        {"message": "My credit card on file has expired, how do I update it?"},
        client=client,
    )
    print(result)

    # --- Validation demo (no API call) ---
    print("\n=== Validation Demo ===")
    errors = instruction_template.validate({"num_points": "5"})
    print(f"Validation errors (missing source_text): {errors}")

    try:
        instruction_template.render({"num_points": "5"})
    except ValueError as e:
        print(f"Render correctly refused: {e}")


if __name__ == "__main__":
    main()
```

**What this system gives you:**

- **Separation of concerns.** Prompt text is defined once, not scattered through application code. Variables are injected at runtime.
- **Validation before execution.** If a required variable is missing or empty, you get a clear error instead of a malformed prompt silently sent to the API.
- **Configurable parameters.** Each template carries its own temperature, max_tokens, and sampling settings. The summarizer runs at temp 0; a brainstorming template could run at temp 0.8.
- **Testability.** You can call `render()` without an API key to inspect the final prompt. You can unit test variable substitution and validation without making any API calls.

---

## SHIP -- Production Patterns

### When to Use Prompt Engineering vs Other Approaches

Prompt engineering is your first line of attack, but it is not always the right long-term solution. Here is a decision framework:

| If you need... | Use | Why |
|----------------|-----|-----|
| The model to follow a specific format or tone | **Prompt engineering** | You are changing behavior, not knowledge. A well-written prompt handles this directly. |
| The model to use current or private data | **RAG** | The model does not have this data. You need to retrieve it and inject it into the prompt. |
| The model to consistently behave in a domain-specific way that prompts cannot reliably enforce | **Fine-tuning** | When the behavioral pattern is too complex or subtle for instructions alone. |
| Reliable structured output (JSON, function calls) | **Prompt engineering + structured output APIs** | Modern APIs (OpenAI's JSON mode, tool use) combine prompt instructions with API-level enforcement. |
| The model to perform a multi-step task with external actions | **Agentic system** | Prompt engineering defines each step, but you need orchestration (tool use, loops, state) around it. |

The progression is almost always: prompt engineering first, then RAG, then fine-tuning. Each layer adds complexity and cost. Do not skip ahead.

### Common Mistakes

**1. Over-engineering the prompt before testing the simple version.**
Many engineers write a 2,000-token system prompt on their first attempt. Start with the simplest prompt that could work. Add complexity only when you observe specific failures. Debugging a 50-word prompt is easy. Debugging a 500-word prompt is painful. You often find that 80% of your elaborate instructions are unnecessary because the model's default behavior already handles those cases.

**2. Ignoring model differences when migrating prompts.**
A prompt tuned for GPT-4 may underperform on Claude, and vice versa. Each model has different strengths, different training data, and different responses to formatting conventions. When you switch models -- even between versions of the same model (GPT-4 to GPT-4o) -- re-evaluate every prompt. What worked before may need adjustment.

**3. Not testing prompts systematically.**
Running a prompt once and declaring it "works" is not testing. You need a set of test inputs that cover normal cases, edge cases, and adversarial cases. You need to run them consistently and compare outputs. This is prompt evaluation, and it is as important as unit testing your code. Without it, you are deploying a system whose core behavior is unverified.

**4. Treating temperature as a magic dial.**
Setting temperature to 0.7 "because creative tasks need creativity" without understanding what temperature actually does leads to inconsistent, unreliable output. Most production systems should start at temperature 0 and only increase it when deterministic output is demonstrably too rigid for the use case. Even then, increase in small increments (0.1-0.2) and evaluate the effect.

**5. Stuffing too much context into a single prompt.**
More context is not always better. When a prompt exceeds several thousand tokens of context, models can lose track of information (the "lost in the middle" phenomenon). They may also start ignoring instructions in favor of the context. If your prompt has grown past a page of text, consider breaking it into chain prompts or filtering the context to only what is directly relevant.

**6. Hardcoding prompts in application code.**
Prompts change more frequently than code. If your prompt is a string literal inside a function, every change requires a code deployment. Store prompts in configuration files, databases, or template files. Version control them separately. Make it possible to update a prompt without redeploying your application.

### Production Checklist

**Version control your prompts.**
Every prompt change should be tracked with the same rigor as a code change. Use git. Include commit messages that explain why the prompt changed, not just what changed. When a prompt regression occurs (and it will), you need to be able to diff and revert.

**Test across models.**
If your system supports multiple models or you plan to migrate in the future, test every prompt on every target model. Maintain a test suite with expected outputs (or at minimum, expected output characteristics like format, length, and key content).

**Monitor prompt performance.**
Track metrics that matter for your use case: response accuracy (measured by human eval or automated checks), response latency, token usage, error rates (malformed output, refusals, hallucinations). Set up alerts for regressions. A model update from your provider can silently change how your prompts behave.

**Handle edge cases explicitly.**
What happens when the user input is empty? What if it is in a different language than expected? What if it contains prompt injection attempts? What if the context is too long to fit? Your prompts and the code around them need to handle these gracefully. Add explicit instructions: "If the input is empty or unclear, respond with: 'I need more information to help with that.'"

**Document prompt design decisions.**
Future you (or your teammate) will look at a prompt and wonder why it includes a particular instruction. Add comments -- either in the template file or in a companion document -- that explain the reasoning. "Added 'respond only in JSON' constraint after observing that the model occasionally prepended conversational text to the JSON output (2024-11-15)."

---

## Further Reading

- **[Anthropic Prompt Engineering Guide](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview)** -- Anthropic's official guide for prompting Claude. Covers XML tag usage, chain of thought, and Claude-specific patterns. The most practical first-party guide available.

- **[OpenAI Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)** -- OpenAI's official guide. Covers strategies for GPT models including structured outputs and JSON mode. Good side-by-side reading with the Anthropic guide to understand model-specific differences.

- **[Brex Prompt Engineering Guide](https://github.com/brexhq/prompt-engineering)** -- An open-source, community-maintained guide with practical, production-oriented advice. Stronger on real-world patterns than the vendor docs.

- **[DAIR.AI Prompt Engineering Guide](https://www.promptingguide.ai/)** -- Comprehensive academic and practical coverage of prompting techniques including chain-of-thought, self-consistency, tree-of-thought, and ReAct. The most thorough reference on advanced prompting methods.

- **[Simon Willison's Blog](https://simonwillison.net/)** -- Not a prompt engineering guide per se, but the best ongoing source of practical insight into how LLMs behave, with frequent deep-dives into prompting patterns, model comparisons, and real-world gotchas.

---

*Last updated: 2026-09-26*
