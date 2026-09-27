# Structured Outputs [ACTIVE]

**Last Updated:** 2026-09-26

---

## What Are Structured Outputs?

Structured outputs refer to techniques and features that constrain an LLM's response to conform to a predefined schema -- typically JSON, but also XML, YAML, or other structured formats. Instead of hoping the model returns valid, parseable data, structured outputs guarantee it.

This is one of the most important capabilities for production AI applications, where downstream systems need to reliably parse and act on LLM responses.

## Why Structured Outputs Matter for Production AI

1. **Reliability** -- Production systems cannot tolerate malformed responses. A JSON parsing error at 2 AM should not crash your pipeline.
2. **Type safety** -- Structured outputs integrate with typed programming languages, enabling compile-time or runtime validation.
3. **Composability** -- When LLM outputs conform to schemas, they can be piped directly into APIs, databases, and other services.
4. **Reduced post-processing** -- No need for brittle regex parsing or custom extraction logic.
5. **Better evaluation** -- Structured outputs make it straightforward to compare model outputs against expected values field by field.

## JSON Mode vs. Structured Outputs

These terms are often confused. They represent different levels of enforcement.

| Feature | JSON Mode | Structured Outputs |
|---------|-----------|-------------------|
| **Guarantee** | Output will be valid JSON | Output will be valid JSON conforming to a specific schema |
| **Schema enforcement** | No -- any valid JSON is accepted | Yes -- must match the provided JSON Schema |
| **Field presence** | Not guaranteed | Guaranteed (required fields will always appear) |
| **Type correctness** | Not guaranteed (a number field might be a string) | Guaranteed (types match the schema) |
| **Enum values** | Not enforced | Enforced (output constrained to specified values) |
| **Use case** | Simple cases where any JSON is acceptable | Production applications requiring specific data structures |

## Approaches and Tools

### OpenAI Structured Outputs

OpenAI provides native structured output support in their API via the `response_format` parameter:

```python
from openai import OpenAI
from pydantic import BaseModel

client = OpenAI()

class CalendarEvent(BaseModel):
    name: str
    date: str
    participants: list[str]
    location: str | None
    is_recurring: bool

completion = client.beta.chat.completions.parse(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "Extract the event information."},
        {"role": "user", "content": "Alice and Bob are meeting at the cafe next Tuesday for a project sync."}
    ],
    response_format=CalendarEvent,
)

event = completion.choices[0].message.parsed
# event is a CalendarEvent instance with guaranteed field types
print(event.name)           # "Project Sync"
print(event.participants)   # ["Alice", "Bob"]
print(event.is_recurring)   # False
```

Key properties:
- Uses constrained decoding (grammar-based enforcement at the token level)
- 100% schema adherence -- not probabilistic
- Supports a subset of JSON Schema (no recursive types, limited constraints)
- Works with function/tool calling as well

### Instructor Library

Instructor is a popular open-source library that adds structured output support to any LLM provider using Pydantic models:

```python
import instructor
from openai import OpenAI
from pydantic import BaseModel, Field

client = instructor.from_openai(OpenAI())

class UserInfo(BaseModel):
    name: str = Field(description="The user's full name")
    age: int = Field(description="The user's age in years", ge=0, le=150)
    email: str | None = Field(description="Email address if mentioned")
    interests: list[str] = Field(description="List of hobbies or interests")

user = client.chat.completions.create(
    model="gpt-4o",
    response_model=UserInfo,
    messages=[
        {"role": "user", "content": "John Smith is 32 years old, loves hiking and photography. His email is john@example.com."}
    ],
)

print(user.name)       # "John Smith"
print(user.age)        # 32
print(user.interests)  # ["hiking", "photography"]
```

Key properties:
- Works with OpenAI, Anthropic, Google, Mistral, Ollama, and more
- Uses Pydantic for validation, retries on validation failure
- Supports streaming of partial objects
- Supports validators for complex business logic
- Provider-agnostic -- same code works across LLM providers

### Anthropic Tool Use for Structured Outputs

Anthropic's Claude does not have a dedicated "structured output mode" but achieves the same result through tool use:

```python
import anthropic
import json

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    tools=[
        {
            "name": "record_event",
            "description": "Record a calendar event with structured data",
            "input_schema": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "date": {"type": "string"},
                    "participants": {"type": "array", "items": {"type": "string"}},
                    "location": {"type": "string"},
                    "is_recurring": {"type": "boolean"}
                },
                "required": ["name", "date", "participants", "is_recurring"]
            }
        }
    ],
    tool_choice={"type": "tool", "name": "record_event"},
    messages=[
        {"role": "user", "content": "Alice and Bob are meeting at the cafe next Tuesday for a project sync."}
    ]
)

# Extract the structured tool input
tool_input = response.content[0].input
print(tool_input["name"])          # "Project Sync"
print(tool_input["participants"])  # ["Alice", "Bob"]
```

### Pydantic Models as the Common Thread

Regardless of the provider or library, Pydantic has emerged as the de facto standard for defining LLM output schemas in Python:

```python
from pydantic import BaseModel, Field
from enum import Enum

class Sentiment(str, Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"

class ProductReview(BaseModel):
    """Structured representation of a product review."""
    product_name: str = Field(description="Name of the product being reviewed")
    sentiment: Sentiment = Field(description="Overall sentiment of the review")
    rating: float = Field(description="Rating from 1.0 to 5.0", ge=1.0, le=5.0)
    key_points: list[str] = Field(description="Main points made in the review")
    would_recommend: bool = Field(description="Whether the reviewer would recommend the product")
```

This single Pydantic model can be used with OpenAI's structured outputs, Instructor, or converted to a JSON Schema for Anthropic's tool use -- providing portability across providers.

## Schema Enforcement Mechanisms

| Mechanism | How It Works | Reliability | Provider Support |
|-----------|-------------|-------------|-----------------|
| Prompt-based | Ask the model to output JSON in a specific format | Low -- model may deviate | Any |
| JSON mode | API flag that guarantees valid JSON (no schema) | Medium -- valid JSON but no schema guarantee | OpenAI, others |
| Constrained decoding | Token-level grammar enforcement during generation | Very high -- 100% schema match | OpenAI (native), vLLM, Outlines |
| Retry with validation | Parse output, validate, retry on failure | High -- eventual consistency | Any (via Instructor, custom) |
| Tool/function calling | Model fills in tool parameters per schema | High -- designed for structured data | OpenAI, Anthropic, Google |

## Best Practices

1. **Use Pydantic models** -- Define your schemas as Pydantic models for validation, documentation, and portability.
2. **Prefer native structured outputs** -- When available (OpenAI), use native constrained decoding for maximum reliability.
3. **Use Instructor for multi-provider** -- If you need to support multiple LLM providers, Instructor provides a consistent interface.
4. **Keep schemas simple** -- Deeply nested or highly complex schemas reduce output quality. Flatten where possible.
5. **Add Field descriptions** -- Descriptions in your schema act as implicit prompt engineering, guiding the model.
6. **Validate beyond schema** -- Use Pydantic validators for business logic (e.g., end_date must be after start_date).
7. **Handle edge cases** -- Use Optional fields for data that may not be present. Provide sensible defaults.

## Further Reading

- OpenAI Structured Outputs documentation
- Instructor library documentation: https://python.useinstructor.com
- Pydantic documentation: https://docs.pydantic.dev
- Outlines library (open-source constrained generation): https://github.com/outlines-dev/outlines
