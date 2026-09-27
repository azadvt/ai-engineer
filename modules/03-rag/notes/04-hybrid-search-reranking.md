# Hybrid Search and Reranking

> Module 03 - Phase 2: Core AI Engineering - Estimated reading: ~20 min
> Prerequisites: [03-vector-db-indexing](./03-vector-db-indexing.md)

## The Problem with Pure Vector Search

Vector search finds semantically similar results. That sounds great until you hit these cases:

1. **Keyword misses** -- User searches for "UPI ID rajesh.m@ybl". Vector search looks for meaning, not exact strings. It might return chunks about UPI payments in general instead of the specific ID.

2. **Semantic drift** -- "apple fruit nutrition" and "apple company stock" are both "about apple." Embeddings sometimes confuse these.

3. **Exact match failures** -- Case numbers, phone numbers, account numbers, names. Vector search doesn't reliably match exact strings.

4. **Rare terms** -- Domain-specific jargon or acronyms. If the embedding model didn't see "POCSO" (Protection of Children from Sexual Offences) enough during training, it won't embed it meaningfully.

Pure vector search is great for meaning. It's bad for precision on exact terms. You need both.

---

## Sparse Retrieval: BM25 and TF-IDF

These are traditional keyword-based search methods. They've been around for decades and they're still effective.

### TF-IDF (Term Frequency - Inverse Document Frequency)

Core idea: a word is important in a document if it appears often in that document (TF) but rarely across all documents (IDF).

- "the" appears everywhere -- low IDF, not important
- "rajesh" appears in 3 out of 10,000 documents -- high IDF, very important

### BM25

An improved version of TF-IDF. The current standard for keyword search. It adds:
- Diminishing returns for term frequency (the 10th occurrence of "money" isn't 10x more important than the 1st)
- Document length normalization (longer documents aren't unfairly penalized)

```python
# BM25 with rank_bm25
from rank_bm25 import BM25Okapi

corpus = [
    "suspect transferred money via UPI",
    "victim reported abuse on social media",
    "bank records show transaction to rajesh.m@ybl",
]

tokenized_corpus = [doc.lower().split() for doc in corpus]
bm25 = BM25Okapi(tokenized_corpus)

query = "rajesh.m@ybl UPI transfer"
tokenized_query = query.lower().split()
scores = bm25.get_scores(tokenized_query)
# Returns scores for each document. Highest score = best match.
```

### When Sparse Beats Dense

- Exact term matching (names, IDs, codes)
- Short, keyword-heavy queries
- When the embedding model doesn't understand the domain
- Out-of-vocabulary terms

### When Dense Beats Sparse

- Conceptual/semantic queries ("evidence of financial exploitation")
- Paraphrased content (query uses different words than the document)
- Multilingual search
- When the user doesn't know the exact terms to search for

---

## Dense Retrieval: Embedding-Based Search

This is the vector search from the RAG fundamentals note. Embed the query, find nearest vectors.

**Strengths:**
- Understands meaning beyond keywords
- Handles paraphrasing ("sent money" matches "financial transfer")
- Works across languages if using multilingual embeddings

**Weaknesses:**
- Can miss exact terms
- Computationally expensive (needs embedding model + vector DB)
- Embedding quality depends heavily on the model
- Fails on out-of-domain content the embedding model wasn't trained on

---

## Hybrid Search: Combining Sparse + Dense

The best of both worlds. Run both keyword search and vector search, then merge the results.

### How to Combine: Reciprocal Rank Fusion (RRF)

The most common merging strategy. Simple and effective.

For each document that appears in any result list, compute:

```
RRF_score = sum(1 / (k + rank_i)) for each result list i where the doc appears
```

Where `k` is a constant (usually 60) and `rank_i` is the document's rank in result list i.

```python
def reciprocal_rank_fusion(results_lists, k=60):
    """
    results_lists: list of lists, each containing (doc_id, score) tuples
                   ordered by relevance (best first)
    """
    fused_scores = {}
    for results in results_lists:
        for rank, (doc_id, _) in enumerate(results):
            if doc_id not in fused_scores:
                fused_scores[doc_id] = 0
            fused_scores[doc_id] += 1 / (k + rank + 1)

    # Sort by fused score, descending
    return sorted(fused_scores.items(), key=lambda x: x[1], reverse=True)

# Example
vector_results = [("doc_A", 0.95), ("doc_C", 0.89), ("doc_B", 0.85)]
bm25_results = [("doc_B", 12.3), ("doc_A", 10.1), ("doc_D", 8.7)]

fused = reciprocal_rank_fusion([vector_results, bm25_results])
# doc_A and doc_B appear in both lists, so they get boosted
```

### Weighted Scoring

Instead of RRF, normalize scores from each system and combine with weights:

```
final_score = alpha * vector_score + (1 - alpha) * bm25_score
```

Where alpha is a tunable parameter (0.5 = equal weight, 0.7 = favor vector search).

### Built-in Hybrid Search

Some vector databases have hybrid search built in:

```python
# Weaviate hybrid search
results = client.query.get("Evidence", ["content", "source"]) \
    .with_hybrid(query="UPI transfer to rajesh", alpha=0.5) \
    .with_limit(10) \
    .do()

# Qdrant hybrid search (using query API)
from qdrant_client.models import Query, Prefetch, FusionQuery

results = client.query_points(
    collection_name="evidence",
    prefetch=[
        Prefetch(query=dense_vector, using="dense", limit=20),
        Prefetch(query=sparse_vector, using="sparse", limit=20),
    ],
    query=FusionQuery(fusion="rrf"),
    limit=10,
)
```

---

## Why Retrieval Alone Isn't Enough: The Reranking Stage

Retrieval (whether vector, keyword, or hybrid) is a fast, rough filter. It narrows millions of chunks to a shortlist of 20-100 candidates. But this shortlist still has noise.

The problem: retrieval models (bi-encoders) encode the query and each document independently. They never see the query and document together. They can't do fine-grained comparison.

Reranking fixes this. A reranker takes each (query, document) pair and scores how well the document answers the query. It's slower but much more accurate.

---

## Cross-Encoder Rerankers

### Bi-Encoder (Retrieval)
Encodes query and document separately. Compares their vectors.

```
query  --> [Encoder] --> query_vector  --|
                                         |--> cosine_similarity --> score
document --> [Encoder] --> doc_vector  --|
```

Fast because you can pre-compute document vectors. But the encoder never sees query + document together.

### Cross-Encoder (Reranking)
Processes query and document together as a single input. The model sees both simultaneously.

```
[query + document] --> [Encoder] --> score
```

Much more accurate because it can compare specific parts of the query against specific parts of the document. But you can't pre-compute anything -- you must run the model for every (query, document) pair.

That's why you use a bi-encoder first (fast, handles millions) and a cross-encoder second (slow, handles tens).

---

## Practical Reranking Options

### Cohere Rerank
API-based. Simple to use, good quality.

```python
import cohere

co = cohere.Client("your-api-key")

results = co.rerank(
    query="financial transactions linked to suspect",
    documents=retrieved_chunks,  # list of strings
    top_n=5,
    model="rerank-english-v3.0",
)

for result in results.results:
    print(f"Index: {result.index}, Score: {result.relevance_score}")
```

### BGE Reranker (Open Source)
From BAAI. Run locally, no API needed.

```python
from FlagEmbedding import FlagReranker

reranker = FlagReranker("BAAI/bge-reranker-v2-m3", use_fp16=True)

pairs = [
    ["financial transactions linked to suspect", chunk]
    for chunk in retrieved_chunks
]
scores = reranker.compute_score(pairs)
```

### ColBERT
A middle ground between bi-encoder and cross-encoder. It encodes query and document separately (like bi-encoder) but keeps token-level embeddings and does late interaction (token-level matching). Faster than cross-encoders, more accurate than bi-encoders.

### FlashRank
Lightweight, fast, runs on CPU. Good for prototyping.

```python
from flashrank import Ranker, RerankRequest

ranker = Ranker(model_name="ms-marco-MultiBERT-L-12")
request = RerankRequest(query=query, passages=passages)
results = ranker.rerank(request)
```

---

## The Full Retrieval Pipeline

Here's how it all fits together:

```
User Query
    |
    v
[Query Processing] -- rewrite, expand, or decompose the query
    |
    v
[Hybrid Retrieval] -- BM25 (top 50) + Vector Search (top 50)
    |
    v
[Fusion] -- RRF or weighted merge --> top 50 unique results
    |
    v
[Reranking] -- Cross-encoder scores each (query, doc) pair --> top 10
    |
    v
[LLM Generation] -- top 5-10 chunks go into the prompt
    |
    v
Final Answer
```

Each stage is a funnel. You cast a wide net at the top and narrow down aggressively.

---

## When Hybrid Beats Pure Vector (and When It Doesn't)

### Hybrid wins:
- Queries with specific identifiers (case numbers, names, phone numbers)
- Domain-specific terminology the embedding model wasn't trained on
- Mixed queries ("POCSO Act section 6 punishment details")
- When you can't afford to miss a keyword match

### Pure vector wins:
- Purely conceptual queries with no important keywords
- When the user's language doesn't match the document's language
- Very short queries where BM25 has little to work with (e.g., "exploitation")

### Pure keyword wins:
- Exact string lookup
- Log search, structured data search
- When semantic meaning doesn't matter, just term presence

In practice, hybrid + reranking beats everything else for most RAG applications. The cost is complexity and latency. For a POC, pure vector is fine. For production, invest in hybrid.

---

## SHIP -- Production Patterns

Here's how this applies in real-world production systems:

In ACPIA, an investigator might search: "bank transfer to rajesh.m@ybl in March."

- **Pure vector search** might find chunks about bank transfers in general but miss the specific UPI ID.
- **Pure keyword search** would find "rajesh.m@ybl" exactly but might miss chunks that say "payment sent to Rajesh's account."
- **Hybrid search** catches both: exact UPI ID matches from BM25 and semantically related financial transaction descriptions from vector search.
- **Reranking** then puts the most relevant chunks at the top: the ones that mention both the specific ID and the financial context.

For evidence retrieval in investigations, missing a relevant document can mean missing critical evidence. Hybrid search with reranking is not optional -- it's a core requirement.

Last updated: 2026-09-26
