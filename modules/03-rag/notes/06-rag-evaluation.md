# RAG Evaluation Tooling and Metrics

> Module 03 - Phase 2: Core AI Engineering - Estimated reading: ~25 min
> Prerequisites: [04-hybrid-search-reranking](./04-hybrid-search-reranking.md), [05-embedding-ambiguity](./05-embedding-ambiguity.md)

## Why RAG Evaluation Is Hard

With traditional software, testing is binary: the function returns the right value or it doesn't. With RAG, there's no single right answer. A response can be:
- Correct but incomplete
- Complete but poorly worded
- Factually accurate but not answering the actual question
- Based on the right source but drawing the wrong conclusion

You're evaluating two separate systems (retriever and generator) that interact in complex ways. Bad retrieval can cause good generation to fail. Good retrieval can still lead to bad generation if the LLM misreads the context.

You need to evaluate both components independently AND the system as a whole.

---

## Component 1: Retrieval Quality

These metrics tell you if the retriever is finding the right chunks.

### Precision@k
Of the top-k retrieved chunks, what fraction is actually relevant?

```
Precision@5 = (number of relevant chunks in top 5) / 5
```

If you retrieve 5 chunks and 3 are relevant: Precision@5 = 0.6.

High precision means you're not wasting context window space on irrelevant chunks.

### Recall@k
Of all relevant chunks in the database, what fraction did you retrieve in the top-k?

```
Recall@10 = (relevant chunks in top 10) / (total relevant chunks in DB)
```

If there are 8 relevant chunks in total and you retrieve 6 of them in top-10: Recall@10 = 0.75.

High recall means you're not missing important evidence. In ACPIA, missing a relevant chunk could mean missing critical evidence.

### MRR (Mean Reciprocal Rank)
At what position does the first relevant result appear?

```
RR = 1 / (rank of first relevant result)
MRR = average of RR across all queries
```

If the first relevant result is at position 3: RR = 1/3 = 0.33.
If it's at position 1: RR = 1.0.

MRR tells you: on average, how quickly does the user see a relevant result?

### NDCG (Normalized Discounted Cumulative Gain)
Like precision, but position-aware. Relevant results at the top are worth more than relevant results at the bottom.

A relevant chunk at position 1 is scored higher than a relevant chunk at position 10, because results lower in the list are "discounted."

NDCG ranges from 0 to 1. Perfect ranking = 1.0.

This matters when you're sending chunks to an LLM: chunks earlier in the prompt get more attention (the "lost in the middle" effect).

---

## Component 2: Generation Quality

These metrics evaluate the LLM's answer.

### Faithfulness
Does the answer only contain information from the retrieved context? Or does the LLM add information from its own training data (or hallucinate)?

```
Faithfulness = (claims in answer supported by context) / (total claims in answer)
```

A faithfulness score of 0.8 means 80% of the answer's claims come from the retrieved chunks. The other 20% is either from the LLM's own knowledge or made up.

For ACPIA, faithfulness must be near 1.0. An investigation report that includes hallucinated evidence is dangerous.

### Answer Relevancy
Does the answer actually address the question? An answer can be factually correct and well-grounded but still not answer what was asked.

Question: "When did the suspect create the account?"
Answer: "The suspect had a UPI account linked to his phone number."

Factually correct, grounded in context, but doesn't answer "when."

### Completeness
Does the answer cover all the important information from the retrieved context? Or does it cherry-pick one fact and ignore others?

---

## End-to-End Evaluation

### Answer Correctness
Compare the system's answer to a known correct answer (ground truth). This is the most intuitive metric but also the hardest to compute, because correct answers can be phrased many different ways.

Methods:
- Exact match (too strict for natural language)
- F1 score over tokens (counts word overlap)
- Semantic similarity between answer and ground truth
- LLM-as-judge (have another LLM evaluate if the answer is equivalent)

### Hallucination Rate
Across all queries, what percentage of answers contain hallucinated information?

```
Hallucination Rate = (answers with hallucinations) / (total answers)
```

Track this in production. If it trends upward, something is wrong -- maybe your index is stale, or retrieval quality has degraded.

---

## RAGAS Framework

RAGAS (Retrieval Augmented Generation Assessment) is the most widely used RAG evaluation framework. It provides four core metrics:

### Faithfulness
Breaks the answer into individual claims, then checks if each claim is supported by the retrieved context. Uses an LLM to do the checking.

### Answer Relevancy
Generates hypothetical questions from the answer, then compares those questions to the original question. If the answer is relevant, the hypothetical questions should be similar to the original.

### Context Precision
Of the retrieved chunks, are the relevant ones ranked higher than the irrelevant ones? This catches cases where you retrieve good chunks but they're buried under bad ones.

### Context Recall
Does the retrieved context contain all the information needed to answer the question? Compares context against the ground truth answer.

```python
from ragas import evaluate
from ragas.metrics import (
    faithfulness,
    answer_relevancy,
    context_precision,
    context_recall,
)
from datasets import Dataset

# Prepare evaluation data
eval_data = {
    "question": [
        "What phone number is associated with the suspect?",
        "When was the last financial transaction?",
    ],
    "answer": [
        "The suspect's phone number is +91 94956 73201.",
        "The last transaction was on March 15, 2026.",
    ],
    "contexts": [
        ["Contact: Rajesh Menon, +91 94956 73201, registered under BSNL Kerala"],
        ["Transaction log: March 15, 2026 - Rs 5000 transferred to account ending 4521"],
    ],
    "ground_truth": [
        "+91 94956 73201",
        "March 15, 2026",
    ],
}

dataset = Dataset.from_dict(eval_data)

results = evaluate(
    dataset,
    metrics=[faithfulness, answer_relevancy, context_precision, context_recall],
)

print(results)
# {'faithfulness': 0.95, 'answer_relevancy': 0.92,
#  'context_precision': 0.88, 'context_recall': 0.90}
```

RAGAS is simple to set up and gives you a solid baseline. Start here.

---

## Other Evaluation Tools

### DeepEval
More metrics than RAGAS, including:
- G-Eval (LLM-based evaluation with chain-of-thought)
- Toxicity, bias detection
- Summarization quality
- Custom metric support

```python
from deepeval import evaluate
from deepeval.test_case import LLMTestCase
from deepeval.metrics import FaithfulnessMetric, AnswerRelevancyMetric

test_case = LLMTestCase(
    input="What is the suspect's UPI ID?",
    actual_output="The suspect uses rajesh.m@ybl for UPI transactions.",
    retrieval_context=["UPI ID: rajesh.m@ybl, linked to Rajesh Menon's SBI account"],
)

faithfulness = FaithfulnessMetric(threshold=0.7)
relevancy = AnswerRelevancyMetric(threshold=0.7)

evaluate([test_case], [faithfulness, relevancy])
```

### TruLens
Focuses on tracing and evaluating LLM app components. Good for debugging which step in the pipeline caused a bad answer.

- Tracks each step: retrieval, prompt construction, generation
- Provides "groundedness" scores (similar to faithfulness)
- Dashboard for visualizing evaluation results over time

### Phoenix (Arize)
Production monitoring for LLM applications. Goes beyond evaluation into observability:

- Trace every query through the pipeline
- Detect embedding drift (your data distribution is changing)
- Cluster problematic queries
- A/B test different retrieval strategies

---

## LLM-as-Judge

Use a strong LLM (GPT-4, Claude) to evaluate another LLM's output. This sounds circular, but it works well in practice.

```python
def llm_judge(question, answer, context, judge_llm):
    prompt = f"""You are evaluating a RAG system's answer.

Question: {question}
Retrieved Context: {context}
System Answer: {answer}

Evaluate on three criteria (score 1-5 each):
1. Faithfulness: Does the answer only use information from the context?
2. Relevance: Does the answer address the question?
3. Completeness: Does the answer cover all relevant information from the context?

For each criterion, explain your reasoning, then give a score.
"""
    return judge_llm.generate(prompt)
```

Why it works:
- LLMs are good at comparing texts and spotting inconsistencies
- Much cheaper than human evaluation at scale
- Correlates well with human judgment (studies show 80-90% agreement)

Limitations:
- The judge LLM can also make mistakes
- Bias toward verbose, confident-sounding answers
- Can't catch factual errors the judge model itself doesn't know about

Best practice: validate your LLM judge against human annotations on a small set first. Make sure it agrees with humans before trusting it at scale.

---

## Building Evaluation Datasets

You need a set of (question, ground_truth_answer, relevant_chunks) tuples. This is called a "golden dataset."

### Manual creation
Domain experts write questions and answers based on actual documents. High quality, expensive, time-consuming.

For ACPIA: have investigators write 50-100 questions they'd actually ask during a case, with correct answers from the evidence.

### Synthetic generation
Use an LLM to generate QA pairs from your documents:

```python
def generate_qa_pairs(chunk, llm):
    prompt = f"""Based on this text, generate 3 question-answer pairs.
The questions should be ones an investigator might ask.
The answers must come directly from the text.

Text: {chunk}

Format:
Q: [question]
A: [answer]
"""
    return llm.generate(prompt)
```

Synthetic data is good for coverage but needs human review. The LLM might generate trivial or unrealistic questions.

### Hybrid approach (recommended)
1. Generate synthetic QA pairs from your documents
2. Have domain experts review, edit, and filter them
3. Experts add 20-30 real-world questions the LLM missed
4. Result: 100-200 high-quality evaluation pairs with good coverage

---

## Continuous Evaluation in Production

Evaluation isn't a one-time thing. In production, you need ongoing monitoring.

### What to track:
- **Retrieval latency** -- Is search getting slower as the index grows?
- **Retrieval scores** -- Are average similarity scores dropping? Maybe new documents don't embed well with your current model.
- **Faithfulness over time** -- Track weekly average. A drop means the LLM is hallucinating more, possibly because retrieval quality degraded.
- **User feedback** -- Thumbs up/down on answers. The most direct signal.
- **No-result queries** -- When retrieval returns nothing above the similarity threshold. These queries reveal gaps in your knowledge base.
- **Embedding drift** -- The distribution of query embeddings shifts over time as users ask new types of questions. If your index doesn't cover these new topics, retrieval quality drops.

### How to monitor:

```python
# Simple logging approach
import logging
from datetime import datetime

def log_rag_query(query, retrieved_chunks, answer, scores):
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "query": query,
        "num_chunks_retrieved": len(retrieved_chunks),
        "top_similarity_score": max(scores),
        "avg_similarity_score": sum(scores) / len(scores),
        "answer_length": len(answer),
    }
    logging.info(f"RAG_QUERY: {log_entry}")

# Periodically run RAGAS evaluation on a sample of logged queries
# Compare against your baseline metrics
# Alert if faithfulness drops below threshold
```

### Alerting thresholds (examples):
- Average faithfulness drops below 0.85: investigate retrieval quality
- More than 10% of queries have top similarity score below 0.7: check for embedding model issues or missing documents
- Retrieval latency exceeds 500ms p95: index may need optimization

---

## SHIP -- Production Patterns

Here's how this applies in real-world production systems:

ACPIA has specific evaluation needs beyond general RAG:

### Entity extraction accuracy
The system extracts phone numbers, UPI IDs, names, social media handles from evidence. Evaluate:
- **Precision**: Of extracted entities, how many are correct?
- **Recall**: Of all entities in the evidence, how many were extracted?
- Compare extracted entities against a manually annotated evidence set.

### Timeline correctness
The system generates event timelines. Evaluate:
- Are events in the correct chronological order?
- Are dates/times accurate?
- Are any events missing?
- Are any events hallucinated (not supported by evidence)?

```python
# Example: evaluating timeline extraction
def evaluate_timeline(generated_timeline, ground_truth_timeline):
    # Check ordering
    order_correct = all(
        generated_timeline[i]["date"] <= generated_timeline[i+1]["date"]
        for i in range(len(generated_timeline) - 1)
    )

    # Check coverage
    gt_events = set(e["event_id"] for e in ground_truth_timeline)
    gen_events = set(e["event_id"] for e in generated_timeline)

    recall = len(gt_events & gen_events) / len(gt_events)
    precision = len(gt_events & gen_events) / len(gen_events) if gen_events else 0

    return {
        "order_correct": order_correct,
        "event_recall": recall,
        "event_precision": precision,
    }
```

### Cross-reference accuracy
When the system links a phone number to a UPI ID to a name, is the linkage correct? A wrong cross-reference in an investigation is worse than no cross-reference at all.

Build a test set of known entity relationships and verify the system discovers them correctly.

---

## Evaluation Cheat Sheet

| What you're evaluating | Metric | Tool |
|----------------------|--------|------|
| Are the right chunks retrieved? | Precision@k, Recall@k, MRR | RAGAS, custom code |
| Are relevant chunks ranked highly? | NDCG, Context Precision | RAGAS |
| Is the answer grounded in context? | Faithfulness | RAGAS, DeepEval |
| Does the answer address the question? | Answer Relevancy | RAGAS, DeepEval |
| Is the answer factually correct? | Answer Correctness | LLM-as-judge, human eval |
| Is the system hallucinating? | Hallucination Rate | DeepEval, custom logging |
| Is the system degrading over time? | Metric trends | Phoenix, custom dashboards |

Start with RAGAS for quick evaluation during development. Add DeepEval for more granular metrics. Use Phoenix or custom logging for production monitoring. Always validate with human evaluation on critical use cases.

Last updated: 2026-09-26
