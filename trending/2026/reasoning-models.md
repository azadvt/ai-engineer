# Reasoning Models [HOT]

**Last Updated:** 2026-09-26

---

## What Are Reasoning Models?

Reasoning models are large language models specifically designed or fine-tuned to perform explicit, step-by-step reasoning before producing a final answer. Unlike standard LLMs that generate responses in a single forward pass, reasoning models allocate additional inference-time compute to "think through" problems, often producing an internal chain-of-thought (CoT) before delivering a conclusion.

The core insight: by spending more compute at inference time rather than solely at training time, models can achieve substantially better performance on complex tasks such as math, code generation, logic puzzles, and multi-step planning.

## Why Reasoning Models Matter for AI Engineers

1. **Improved accuracy on hard tasks** -- Reasoning models dramatically outperform standard models on problems requiring multi-step logic, reducing the need for complex prompt engineering or multi-agent orchestration.
2. **Cost/latency trade-off** -- They consume significantly more tokens and time per request, forcing engineers to make deliberate architectural decisions about when to use them.
3. **Reduced prompt engineering burden** -- Many tasks that previously required elaborate few-shot prompting or chain-of-thought prompting work well with simple instructions on reasoning models.
4. **New application patterns** -- Tasks previously considered impractical for LLMs (formal verification, complex planning, research synthesis) become viable.

## Key Models

### OpenAI o-Series

- **o1** -- First major reasoning model released by OpenAI (late 2024). Uses hidden chain-of-thought tokens. Excels at math, coding, and scientific reasoning.
- **o1-pro** -- Higher-compute variant with extended reasoning. Available through ChatGPT Pro.
- **o3 / o3-mini** -- Next-generation reasoning models (2025). Improved efficiency and performance. o3-mini offers a lower-cost option with configurable reasoning effort (low, medium, high).
- **o4-mini** -- Latest iteration (2025) with further efficiency improvements and tool-use integration.

### Anthropic Claude with Extended Thinking

- Claude models support an "extended thinking" mode where the model explicitly reasons in a visible thinking block before responding.
- Configurable thinking budget allows engineers to control how much compute is spent on reasoning.
- Integrated natively into the API via the `thinking` parameter, making it straightforward to adopt.
- Thinking tokens are visible to the developer (unlike OpenAI's hidden CoT), aiding in debugging and trust.

### Google Gemini Reasoning

- **Gemini 2.5 Pro** and **Gemini 2.5 Flash** include built-in "thinking" capabilities.
- Gemini 2.5 Flash offers a cost-effective reasoning option with a thinking budget parameter.
- Deep integration with Google's ecosystem (Search grounding, code execution).

### DeepSeek R1

- Open-source/open-weight reasoning model that demonstrated competitive performance with proprietary alternatives.
- Trained using reinforcement learning to develop reasoning capabilities.
- Available for self-hosting, making it attractive for privacy-sensitive or cost-sensitive deployments.
- Distilled versions (based on Qwen and Llama architectures) available in smaller sizes (1.5B to 70B).

## Chain-of-Thought: Training Time vs. Inference Time

| Aspect | Training-Time CoT | Inference-Time CoT (Reasoning Models) |
|--------|-------------------|---------------------------------------|
| **Mechanism** | Model trained on CoT examples; learns to produce reasoning as part of output | Model uses dedicated compute budget at inference to reason before answering |
| **Cost at inference** | Standard token costs | Higher token costs due to thinking tokens |
| **Latency** | Standard latency | Higher latency (seconds to minutes for hard problems) |
| **Control** | Prompt-dependent (must ask for reasoning) | Built-in; configurable budget in some models |
| **Reliability** | Inconsistent; model may skip steps | More reliable; architecturally enforced |
| **Transparency** | Visible in output | Varies: visible (Claude), hidden (o-series), or configurable |

## Comparison Table

| Model | Provider | Open Weights | Thinking Visibility | Configurable Effort | Relative Cost | Best For |
|-------|----------|-------------|---------------------|---------------------|---------------|----------|
| o3 | OpenAI | No | Hidden | No | High | Complex reasoning, math, code |
| o3-mini | OpenAI | No | Hidden | Yes (low/med/high) | Medium | Cost-effective reasoning tasks |
| o4-mini | OpenAI | No | Hidden | Yes | Medium | Tool-use with reasoning |
| Claude (extended thinking) | Anthropic | No | Visible | Yes (token budget) | Medium-High | Debugging-friendly reasoning, long analysis |
| Gemini 2.5 Pro | Google | No | Visible | Yes (token budget) | Medium-High | Multimodal reasoning, Google ecosystem |
| Gemini 2.5 Flash | Google | No | Visible | Yes (token budget) | Low-Medium | Cost-effective reasoning |
| DeepSeek R1 | DeepSeek | Yes | Visible | No | Low (self-hosted) | Privacy-sensitive, budget-constrained |
| DeepSeek R1 Distilled | DeepSeek | Yes | Visible | No | Very Low | Edge deployment, experimentation |

## When to Use Reasoning Models vs. Standard Models

**Use a reasoning model when:**

- The task involves multi-step logic, math, or formal reasoning
- Accuracy is more important than latency or cost
- You would otherwise need complex multi-agent pipelines to break down the problem
- The task benefits from self-correction (the model can catch its own errors during thinking)

**Use a standard model when:**

- The task is straightforward (classification, simple generation, summarization)
- Low latency is critical (real-time chat, autocomplete)
- Cost per request must be minimized at scale
- The reasoning overhead would not improve output quality

## Cost and Latency Trade-Offs

- Reasoning models typically use 3x to 20x more tokens than standard models for the same prompt, due to thinking tokens.
- Latency can range from a few seconds to several minutes for very complex problems.
- Practical strategy: use a standard model as the default, and route only complex or high-stakes queries to a reasoning model. This can be done with a classifier or heuristic-based routing layer.
- Some providers (OpenAI, Google) offer "mini" reasoning variants that provide a middle ground.

## Further Reading

- OpenAI reasoning model documentation
- Anthropic extended thinking documentation
- DeepSeek R1 technical report
- "Scaling LLM Test-Time Compute" research line
