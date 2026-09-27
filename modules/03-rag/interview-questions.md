# RAG -- Interview Questions and Answers

A set of interview questions covering Retrieval-Augmented Generation, organized by difficulty and category. Each answer is collapsible. Use these to prepare for AI/ML engineering interviews where RAG is a core topic.

---

## Conceptual Questions

### 1. What is RAG and when would you use it? [Beginner]

**What they're testing:** Do you understand the fundamental motivation behind RAG and its place relative to other LLM techniques.

<details>
<summary>Answer</summary>

RAG stands for Retrieval-Augmented Generation. It is a technique where, before an LLM generates a response, you retrieve relevant documents from an external knowledge base and inject them into the prompt as context. The LLM then generates an answer grounded in that retrieved information.

You use RAG when:
- The LLM needs access to private or proprietary data it was never trained on (company documents, case files, internal databases).
- The information changes frequently and you cannot retrain the model every time.
- You need to reduce hallucination by grounding responses in actual source material.
- The knowledge required is beyond the model's training cutoff date.

RAG solves three core LLM limitations: knowledge cutoff, no access to private data, and hallucination. It does so by giving the model the actual source material at query time rather than expecting the model to "know" the answer from training.

</details>

---

### 2. How does RAG compare to fine-tuning and prompt engineering? When would you choose one over the others? [Beginner]

**What they're testing:** Whether you understand the trade-offs between the three main approaches to customizing LLM behavior and can make practical recommendations.

<details>
<summary>Answer</summary>

The three approaches serve different purposes:

| Approach | What It Changes | When to Use |
|----------|----------------|-------------|
| **Prompt Engineering** | How the model behaves (format, tone, instructions) | Always start here. Use when you need the model to follow a specific format or reasoning style. |
| **RAG** | What the model knows at query time | When the model needs external, private, or frequently changing knowledge. |
| **Fine-Tuning** | The model's weights permanently | When you need the model to learn a new skill, style, or domain-specific behavior that prompt engineering cannot achieve, and you have sufficient training data. |

Rules of thumb:
1. Start with prompt engineering. It is the cheapest and fastest to iterate.
2. Add RAG when you need external or private knowledge that the model does not have.
3. Fine-tune only when RAG plus prompt engineering are insufficient -- typically for changing the model's style, tone, or domain-specific reasoning patterns.
4. These are not mutually exclusive. A production system might fine-tune for behavior/style, use RAG for knowledge, and use prompt engineering for output formatting.

The key distinction: RAG changes what information the model has access to. Fine-tuning changes what the model inherently "knows" or how it processes information. Prompt engineering changes how you ask the model to respond.

</details>

---

### 3. Walk me through the RAG pipeline from raw documents to final answer. [Beginner]

**What they're testing:** Can you explain the end-to-end architecture clearly, covering both the offline indexing phase and the online query phase.

<details>
<summary>Answer</summary>

The RAG pipeline has two phases:

**Offline / Indexing Phase:**
1. **Load** -- Ingest raw documents (PDFs, text files, web pages, databases).
2. **Chunk** -- Split documents into smaller pieces. Strategies range from fixed-size splitting to semantic chunking. The goal is chunks that are specific enough for retrieval but large enough to carry meaningful context.
3. **Embed** -- Run each chunk through an embedding model (e.g., OpenAI text-embedding-3-small, BGE-M3) to convert text into numerical vectors that capture semantic meaning.
4. **Store** -- Insert the vectors into a vector database (Pinecone, Qdrant, Chroma, etc.) alongside the original text and metadata (source file, page number, date).

**Online / Query Phase:**
5. **Query embedding** -- When a user submits a question, embed the question using the same embedding model.
6. **Retrieve** -- Search the vector database for the top-k chunks whose vectors are most similar to the query vector (typically k=5 to 20). Optionally use hybrid search (vector + BM25 keyword search) and reranking.
7. **Augment** -- Construct a prompt that includes the retrieved chunks as context along with the user's question.
8. **Generate** -- Send the augmented prompt to the LLM. The model reads the context and generates an answer grounded in the retrieved material.

In advanced pipelines, you may also add query rewriting before retrieval, reranking after retrieval, and evaluation/monitoring after generation.

</details>

---

### 4. What are the main chunking strategies and when would you use each? [Intermediate]

**What they're testing:** Depth of understanding about a critical and often underestimated part of the RAG pipeline.

<details>
<summary>Answer</summary>

There are six main strategies:

1. **Fixed-size chunking** -- Split every N characters/tokens with overlap. Simple and fast but cuts through sentences and ideas. Use for quick baselines or text with no meaningful structure.

2. **Recursive character splitting** -- Try splitting on paragraph breaks first, then line breaks, then sentences, then words. Respects natural text boundaries. This is the general-purpose default (LangChain's default splitter).

3. **Semantic chunking** -- Embed each sentence, measure cosine similarity between adjacent sentences, and split where similarity drops. Chunks align with actual topic boundaries. Use for articles, reports, and long-form content. Drawback: requires an embedding model at chunking time, so it is slower and costs money.

4. **Document-aware chunking** -- Use the document's own structure (Markdown headers, HTML tags, code function definitions) as chunk boundaries. Preserves the author's intended structure and attaches headers as metadata. Use for any well-structured document.

5. **Parent-child (hierarchical) chunking** -- Create small "child" chunks for retrieval precision and larger "parent" chunks for generation context. At query time, retrieve matching children but return their parent chunks to the LLM. This is one of the most effective strategies because it optimizes for both retrieval and generation simultaneously.

6. **Agentic chunking** -- Use an LLM to read the document and decide where to split based on meaning. Highest quality but slowest and most expensive. Reserve for high-value documents (legal briefs, medical records) where quality justifies cost.

The critical point: different document types benefit from different strategies. Chat logs, legal documents, and code should not all use the same chunking approach.

</details>

---

### 5. What happens when chunks are too small versus too large? [Intermediate]

**What they're testing:** Understanding of the trade-offs in chunk sizing and the downstream effects on retrieval and generation quality.

<details>
<summary>Answer</summary>

**Too small (under ~100 tokens):**
- Chunks lose context. A chunk containing "He transferred $5000" is useless because it lacks who "he" is, to whom, and when.
- High retrieval recall (you may find relevant fragments) but low usefulness (each fragment is meaningless in isolation).
- More total chunks in the database, which increases storage, slows retrieval, and increases cost.

**Too large (over ~2000 tokens):**
- Chunks mix multiple topics. A single chunk might cover phone numbers, addresses, and financial records.
- The embedding becomes a blurry average of all topics in the chunk, making it harder to match specific queries.
- Fewer chunks needed, but retrieval precision drops significantly.
- Risk of exceeding the LLM's context window when multiple large chunks are retrieved.

**The sweet spot** depends on content type. General guidelines: 200-500 characters for chat logs, 500-1000 for articles/reports, 1000-2000 for legal documents. Always include overlap (10-20% of chunk size) to avoid splitting ideas at boundaries.

The parent-child chunking strategy directly addresses this tension: small chunks for precise retrieval, larger parent chunks for rich generation context.

The only reliable way to find the optimal size is to measure retrieval quality on your actual data with different chunk sizes.

</details>

---

### 6. How does HNSW indexing work and why is it the default choice for most vector databases? [Intermediate]

**What they're testing:** Whether you understand the core algorithm behind production vector search, not just that it exists.

<details>
<summary>Answer</summary>

HNSW (Hierarchical Navigable Small World) is a graph-based approximate nearest-neighbor search algorithm. It is the most widely used indexing algorithm in production vector databases (Qdrant, Weaviate, Chroma, pgvector all use it).

**How it works:**
1. Vectors are organized into a multi-layer graph.
2. The top layer is a sparse graph with long-range connections -- it allows fast, coarse navigation across the entire vector space.
3. Each successive lower layer is denser, with shorter-range connections for more precise local search.
4. The bottom layer is the densest and contains all vectors.
5. At query time, the algorithm starts at the top layer and greedily navigates toward the nearest node to the query vector. It then drops down one layer and repeats. This continues until it reaches the bottom layer, where it performs a fine-grained local search.

An analogy: it is like navigating with a map. First zoom out to find the right city (top layer), then zoom in to find the right neighborhood, then the right street (bottom layers).

**Key parameters:**
- `M` -- Number of connections per node. Higher M means more accurate search but more memory.
- `ef_construction` -- Search width during index building. Higher values produce a better-quality graph.
- `ef_search` -- Search width during queries. Higher values give more accurate results at the cost of latency.

**Why it is the default:**
- 95-99%+ recall (nearly as accurate as brute-force).
- Very fast even for millions of vectors.
- Scales well with dataset size.
- The main trade-off is memory: the graph structure must reside in RAM. For very large datasets (tens of millions of vectors), this can require significant memory (60-80 GB for 10M vectors at 1536 dimensions), which can be mitigated with product quantization or on-disk indexing.

Alternatives like IVF (cluster-based, lower memory) or PQ (compression, lower accuracy) exist for specific constraints, but HNSW is the standard starting point.

</details>

---

### 7. Why is pure vector search insufficient for production RAG systems? [Intermediate]

**What they're testing:** Awareness of semantic search limitations and the practical need for hybrid approaches.

<details>
<summary>Answer</summary>

Pure vector search finds semantically similar results, which sounds ideal but fails in several important cases:

1. **Exact term matching fails.** Searching for a UPI ID like "rajesh.m@ybl" or a case number like "CASE-2026-001" with vector search may return results about UPI payments or cases in general rather than the specific identifier. Embeddings capture meaning, not exact strings.

2. **Rare and domain-specific terms.** If the embedding model was not trained on terms like "POCSO" (Protection of Children from Sexual Offences Act), it cannot embed them meaningfully. The vector for that term will be essentially random.

3. **Numerical precision.** "$5,000" and "$50,000" produce very similar embeddings. The model understands "transaction with a dollar amount" but does not reliably differentiate the actual numbers.

4. **Negation.** "The suspect IS guilty" and "The suspect is NOT guilty" are nearly identical in embedding space because they share most of the same words and structure. Embeddings capture topic, not logical meaning.

5. **Entity confusion.** "Rajesh lives in Kochi" and "Suresh lives in Kochi" have very similar embeddings. The model sees "person lives in Kochi" without strongly differentiating which person.

6. **Query-document mismatch.** Questions and statements occupy different regions of embedding space. A query phrased as "What is the suspect's phone number?" may not match well against a document that simply says "Contact: +91 94956 73201."

These failures are not edge cases. In any system dealing with names, numbers, identifiers, or factual precision, pure vector search will miss critical results. This is why production systems use hybrid search (combining BM25 keyword search with vector search) and reranking.

</details>

---

### 8. How does hybrid search work? What is Reciprocal Rank Fusion (RRF)? [Intermediate]

**What they're testing:** Understanding of how to combine sparse and dense retrieval and the mechanics of result fusion.

<details>
<summary>Answer</summary>

Hybrid search runs two retrieval systems in parallel and merges their results:

1. **Sparse retrieval (BM25):** Traditional keyword-based search. Matches exact terms. Strong for identifiers, names, domain jargon. Uses term frequency and inverse document frequency to score relevance.

2. **Dense retrieval (vector search):** Embedding-based semantic search. Finds conceptually similar content even when different words are used. Strong for paraphrased content and conceptual queries.

Each system returns a ranked list of results. The challenge is merging these lists, because BM25 scores and cosine similarity scores are on completely different scales and are not directly comparable.

**Reciprocal Rank Fusion (RRF)** solves this by ignoring raw scores and using only rank positions:

```
RRF_score(doc) = sum( 1 / (k + rank_i) )  for each list i where the doc appears
```

Where `k` is a constant (typically 60) that prevents documents ranked first from dominating too heavily.

How it works in practice:
- Document A is rank 1 in vector search and rank 2 in BM25: RRF = 1/61 + 1/62 = 0.0326
- Document B is rank 3 in vector search and rank 1 in BM25: RRF = 1/63 + 1/61 = 0.0323
- Document C is rank 2 in vector search only: RRF = 1/62 = 0.0161

Documents that appear in both lists get boosted. Documents that appear in only one list still contribute but rank lower.

An alternative to RRF is weighted scoring: normalize both score sets to [0, 1] and compute `alpha * vector_score + (1 - alpha) * bm25_score`, where alpha is a tunable parameter.

Several vector databases (Weaviate, Qdrant) have hybrid search built in, so you do not need to implement fusion manually.

</details>

---

### 9. What is the difference between a cross-encoder reranker and a bi-encoder? Why use both? [Intermediate]

**What they're testing:** Understanding of the two-stage retrieval architecture and why reranking improves results.

<details>
<summary>Answer</summary>

**Bi-encoder (used in retrieval):**
- Encodes the query and each document independently into separate vectors.
- Compares vectors using cosine similarity or dot product.
- Fast because document vectors can be pre-computed and stored. At query time, you only embed the query and run ANN search.
- Limitation: the encoder never sees the query and document together, so it cannot perform fine-grained comparison between specific parts of the query and specific parts of the document.

**Cross-encoder (used in reranking):**
- Takes the query and a document as a single concatenated input: `[query + document]`.
- The model processes both simultaneously through all transformer layers, allowing deep interaction between query tokens and document tokens.
- Outputs a single relevance score.
- Much more accurate because it can attend to how specific parts of the query relate to specific parts of the document.
- Cannot pre-compute anything. Every (query, document) pair requires a full model forward pass. This makes it too slow for searching millions of documents.

**Why use both:**
The two-stage architecture exploits the strengths of each:
1. The bi-encoder casts a wide net: it quickly narrows millions of chunks down to 20-100 candidates (fast, approximate).
2. The cross-encoder reranks those candidates: it carefully scores each (query, candidate) pair and promotes the most relevant ones to the top (slow, precise).

This is a funnel. The bi-encoder handles scale. The cross-encoder handles precision. Together they deliver fast, accurate retrieval.

Practical reranker options include Cohere Rerank (API), BGE Reranker (open source, GPU), ColBERT (late interaction -- a middle ground between the two), and FlashRank (lightweight, CPU).

</details>

---

### 10. What do embeddings miss? Give specific examples of failure modes. [Intermediate]

**What they're testing:** Awareness that embeddings are not a silver bullet and understanding of their specific blind spots.

<details>
<summary>Answer</summary>

Embeddings capture topical similarity and semantic relatedness well, but they have fundamental blind spots:

1. **Negation.** "The suspect is guilty" and "The suspect is not guilty" produce very similar embeddings. The model captures the topic (suspect, guilt) but does not weight the negation strongly enough. This is a known, structural limitation.

2. **Exact numbers.** "$5,000" and "$50,000" are nearly identical in embedding space. The model understands "dollar transaction" but does not reliably encode the magnitude.

3. **Temporal information.** "The event happened in January" and "The event happened in December" have similar embeddings. Time is poorly represented.

4. **Logical direction.** "A caused B" and "B caused A" have similar embeddings. The model sees that A, B, and causation are present but does not encode directionality.

5. **Entity specificity.** "Rajesh lives in Kochi" and "Suresh lives in Kochi" are nearly identical. The embedding captures "person lives in Kochi" without strongly differentiating which person.

6. **Polysemy in short text.** "Bank" (financial vs. river) is handled reasonably well in long contexts but poorly in short texts where there is insufficient context to disambiguate.

7. **Silent high-confidence failures.** A query about whether a suspect was in Bangalore on March 15 might retrieve a chunk about a different person in Bangalore on a different date with a cosine similarity of 0.89. The score looks confident, but the answer is wrong.

Mitigation strategies include: hybrid search (BM25 catches exact terms), metadata filtering (dates, entity names), HyDE (bridges the query-document style gap), query expansion (multiple phrasings), and multi-vector retrieval (embedding questions the chunk can answer, not just the chunk itself).

</details>

---

### 11. What is HyDE and how does it address the query-document mismatch problem? [Advanced]

**What they're testing:** Understanding of a specific advanced RAG technique and the deeper problem it solves.

<details>
<summary>Answer</summary>

HyDE stands for Hypothetical Document Embedding. It addresses a subtle but important problem: queries and documents are structurally different, and their embeddings may not be similar even when the document contains the answer.

**The problem:**
A user asks: "What is the suspect's phone number?"
The relevant document says: "Contact: +91 94956 73201 (Rajesh Menon)"

The query is a question. The document is a data fragment. They use different words and sentence structures. In embedding space, questions and statements often occupy different regions, so the cosine similarity between them may be lower than expected -- potentially lower than irrelevant-but-topically-similar chunks.

**How HyDE works:**
1. Take the user's query.
2. Ask an LLM to generate a hypothetical answer -- a passage that looks like what a relevant document might say. For example: "The suspect's phone number is +91 XXXXX XXXXX, registered under his name."
3. Embed the hypothetical answer (not the original query).
4. Use that embedding to search the vector store.

The hypothetical answer is structurally similar to real documents (both are statements/passages), so it matches much better against stored document embeddings than the original question would.

**Trade-offs:**
- Adds an LLM call before every search (latency and cost).
- The hypothetical answer may contain hallucinated details, but this is acceptable because we only use it as a search vector -- we never present it to the user.
- Works best for factual lookup queries where the query-document style mismatch is most severe.
- Less beneficial for queries that are already phrased as statements or when the user's phrasing closely matches the document's language.

HyDE is one of several pre-retrieval techniques. Others include query expansion (generating multiple phrasings) and multi-vector retrieval (embedding generated questions for each chunk at indexing time).

</details>

---

### 12. How do you evaluate a RAG system? Walk me through the metrics for both retrieval and generation. [Advanced]

**What they're testing:** Whether you can systematically evaluate a multi-component system, not just build one.

<details>
<summary>Answer</summary>

RAG evaluation is challenging because you have two components (retriever and generator) that interact in complex ways. You need to evaluate each independently and the system end-to-end.

**Retrieval Metrics:**

- **Precision@k:** Of the top-k retrieved chunks, what fraction is relevant? High precision means you are not wasting context window space on irrelevant chunks.
- **Recall@k:** Of all relevant chunks in the database, what fraction did you retrieve in the top-k? High recall means you are not missing important information.
- **MRR (Mean Reciprocal Rank):** At what position does the first relevant result appear? MRR = average of 1/rank across all queries. Tells you how quickly relevant results surface.
- **NDCG (Normalized Discounted Cumulative Gain):** Like precision but position-aware. Relevant chunks ranked higher are scored higher than relevant chunks ranked lower. This matters because of the "lost in the middle" effect -- the LLM pays less attention to content in the middle of the prompt.

**Generation Metrics:**

- **Faithfulness:** What fraction of the claims in the answer are supported by the retrieved context? A faithfulness of 0.8 means 20% of the claims come from the LLM's own knowledge or are hallucinated. For high-stakes applications, this must be near 1.0.
- **Answer Relevancy:** Does the answer actually address the question asked? An answer can be factually correct and grounded in context but still fail to answer what was asked.
- **Completeness:** Does the answer cover all the important information from the retrieved context, or does it cherry-pick one fact and ignore others?

**End-to-End Metrics:**

- **Answer Correctness:** Compare the system's answer to a ground truth answer. Methods include exact match (too strict), F1 over tokens, semantic similarity, or LLM-as-judge.
- **Hallucination Rate:** Across all queries, what percentage of answers contain hallucinated information? Track this over time in production.

**Evaluation requires a golden dataset:** A set of (question, ground_truth_answer, relevant_chunks) tuples. Build this through a hybrid approach: generate synthetic QA pairs from your documents with an LLM, then have domain experts review and supplement with real-world questions.

</details>

---

### 13. What is the RAGAS framework? What metrics does it provide and how do they work? [Advanced]

**What they're testing:** Familiarity with the standard RAG evaluation tooling and understanding of how LLM-based evaluation metrics are computed.

<details>
<summary>Answer</summary>

RAGAS (Retrieval Augmented Generation Assessment) is the most widely used open-source framework for evaluating RAG pipelines. It provides four core metrics that together cover both retrieval and generation quality:

1. **Faithfulness:** Breaks the generated answer into individual claims, then uses an LLM to check whether each claim is supported by the retrieved context. Score = (supported claims) / (total claims). This catches hallucination.

2. **Answer Relevancy:** Generates hypothetical questions from the answer, then compares those generated questions to the original question using semantic similarity. If the answer is relevant, the hypothetical questions should resemble the original question. This catches answers that are factually correct but off-topic.

3. **Context Precision:** Evaluates whether the relevant retrieved chunks are ranked higher than the irrelevant ones. This catches the case where you retrieve good chunks but they are buried under bad ones, which leads to the "lost in the middle" problem.

4. **Context Recall:** Checks whether the retrieved context contains all the information needed to answer the question. Compares the retrieved context against the ground truth answer. Low context recall means the retriever is missing relevant documents.

**Usage:**

```python
from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevancy, context_precision, context_recall
from datasets import Dataset

eval_data = {
    "question": [...],
    "answer": [...],
    "contexts": [[...]],
    "ground_truth": [...],
}
results = evaluate(Dataset.from_dict(eval_data),
    metrics=[faithfulness, answer_relevancy, context_precision, context_recall])
```

RAGAS uses an LLM (typically GPT-4) internally to compute these metrics, which means:
- It costs money to run (LLM API calls for each evaluation).
- The evaluation itself can have errors (the judge LLM can make mistakes).
- You should validate RAGAS scores against human judgment on a small sample before trusting it at scale.

Other evaluation tools include DeepEval (more metrics including toxicity and bias), TruLens (step-by-step pipeline tracing), and Phoenix/Arize (production monitoring and embedding drift detection).

</details>

---

### 14. Design a production RAG system for a legal document search platform. [Advanced -- System Design]

**What they're testing:** Ability to make architectural decisions, justify trade-offs, and handle real-world constraints.

<details>
<summary>Answer</summary>

**Requirements clarification (what to ask the interviewer):**
- How many documents? (Assume: 500K legal documents, growing by 10K/month)
- What types? (Case law, statutes, contracts, briefs)
- Who are the users? (Lawyers, paralegals)
- Latency requirements? (Under 3 seconds end-to-end)
- Data sensitivity? (Highly sensitive -- cannot leave the organization's infrastructure)

**Architecture:**

**1. Ingestion Pipeline:**
- Document parsing: Use `docling` or `unstructured` for PDFs. Legal documents have complex formatting (sections, subsections, footnotes, citations).
- Chunking strategy: Document-aware chunking using section/clause boundaries. Legal documents are well-structured -- use that structure. Apply parent-child chunking: small child chunks (~200 tokens) at the clause level for retrieval, larger parent chunks (~1000 tokens) at the section level for generation context.
- Metadata extraction: Extract case name, date, jurisdiction, court, document type, section headers. This metadata is critical for filtering.
- Embedding model: Self-hosted BGE-M3 (data cannot leave premises). Run on GPU nodes.
- Vector store: Qdrant, self-hosted. It handles metadata filtering well, is fast, and keeps data on-premises. HNSW index with M=16, ef_construction=128.

**2. Query Pipeline:**
- Query processing: Use query expansion (generate alternative phrasings) and HyDE for factual lookup queries. Use an LLM to classify query intent (factual lookup vs. conceptual search vs. case comparison) and route accordingly.
- Retrieval: Hybrid search. BM25 for exact citations, case numbers, and legal terminology. Vector search for conceptual queries. Fuse with RRF.
- Metadata filtering: Pre-filter by jurisdiction, date range, document type when specified in the query.
- Reranking: Self-hosted BGE Reranker. Legal search demands high precision -- a cross-encoder reranker is not optional.
- Generation: LLM generates answer with citations. Each claim must reference the specific document and section it comes from.

**3. Evaluation and Monitoring:**
- Golden dataset: Work with lawyers to create 200+ QA pairs from real legal queries.
- Metrics: RAGAS (faithfulness must be above 0.95 for legal applications), context precision, context recall.
- Production monitoring: Log every query, track faithfulness trends weekly, alert if similarity scores drop or hallucination rate increases.
- Citation verification: Post-generation step that verifies each cited section actually contains the claimed information.

**4. Scaling:**
- 500K documents at ~10 chunks each = ~5M vectors. Well within Qdrant's single-node capacity.
- As data grows, add sharding. Replicate for availability.
- Index rebuild on a schedule (nightly for new documents).

**Key trade-offs discussed:**
- Self-hosted everything (BGE-M3, Qdrant, BGE Reranker) because data sensitivity outweighs the convenience of managed APIs.
- Parent-child chunking adds complexity but is worth it for legal documents where retrieval precision and context richness both matter.
- HyDE adds latency but significantly improves retrieval for factual lookup queries that dominate legal search.

</details>

---

## System Design Questions

### 15. You are building a customer support RAG system for a SaaS company with 10,000 help articles that update weekly. The system must handle 1,000 queries per hour and respond in under 2 seconds. Design the architecture. [Advanced]

**What they're testing:** End-to-end system design thinking, practical trade-offs, and operational considerations.

<details>
<summary>Answer</summary>

**High-Level Architecture:**

```
User Query --> API Gateway --> Query Service --> [Query Rewrite] -->
  [Hybrid Retrieval: BM25 + Vector Search] --> [RRF Fusion] -->
  [Reranker] --> [Prompt Construction] --> [LLM Generation] --> Response
```

**Ingestion Pipeline (runs weekly + on-demand):**
- Document loader pulls updated articles from the CMS via API.
- Chunking: Recursive character splitting (help articles are semi-structured text). Chunk size ~500 tokens, overlap 100 tokens. If articles have clear sections with headers, use document-aware chunking.
- Embedding: OpenAI text-embedding-3-small (SaaS data is not highly sensitive, API is simpler to operate). Batch embed all chunks.
- Vector store: Qdrant Cloud or Pinecone (managed, for operational simplicity at this scale). ~100K vectors (10K articles x ~10 chunks each) is well within managed tier limits.
- BM25 index: Maintain a parallel BM25 index (Elasticsearch or in-memory rank_bm25) for keyword search.
- Re-indexing: Full re-index weekly. Delta updates for articles changed mid-week.

**Query Pipeline (latency budget: 2 seconds total):**
- Query rewrite (~200ms): Light LLM call to expand abbreviations and clarify intent. Skip for simple queries (detect with a classifier).
- Hybrid retrieval (~100ms): BM25 top-50 + vector search top-50 in parallel. Fuse with RRF.
- Reranking (~300ms): Cohere Rerank API on the fused top-30. Return top-5.
- LLM generation (~1000ms): GPT-4o-mini or similar fast model. Feed top-5 chunks with a prompt template that includes instructions to cite sources and say "I don't know" if the context does not contain the answer.
- Total: ~1.6 seconds, within the 2-second budget.

**Handling 1,000 queries/hour:**
- That is roughly 0.28 QPS. Not high traffic. A single API server can handle this.
- Cache frequent queries (many support queries are repetitive). Use a semantic cache: embed the query, check if a similar query was answered recently, return the cached answer.
- Rate limiting at the API gateway.

**Monitoring:**
- Log every query, retrieved chunks, and answer.
- Track: retrieval latency, top similarity scores, faithfulness (sample 5% of queries through RAGAS weekly), user feedback (thumbs up/down on each answer).
- Alert if: average faithfulness drops below 0.85, more than 15% of queries have top similarity score below 0.7, p95 latency exceeds 2 seconds.

**Handling stale content:**
- Articles update weekly, but some updates are urgent (pricing changes, outage notices).
- Implement a webhook from the CMS: when an article is updated, re-chunk, re-embed, and upsert into the vector store immediately.
- Version metadata on each chunk so you can track when it was last updated.

</details>

---

### 16. Your RAG system's faithfulness score has dropped from 0.92 to 0.78 over the past month. How do you diagnose and fix this? [Advanced]

**What they're testing:** Debugging skills for ML systems, systematic thinking about failure modes.

<details>
<summary>Answer</summary>

A faithfulness drop means the LLM is increasingly generating claims not supported by the retrieved context. This can be caused by problems at any stage of the pipeline. Diagnose systematically:

**Step 1: Check retrieval quality first.**
- Sample 50 queries from the past week.
- Manually inspect the retrieved chunks. Are they relevant to the query?
- Compute retrieval metrics (precision@k, recall@k) against your golden dataset.
- If retrieval quality has dropped, the LLM is being given bad context and compensating with hallucinated answers.

**Possible retrieval causes and fixes:**
- **Stale index:** New documents were added to the source but not indexed. Fix: re-run the indexing pipeline, set up automated index refreshes.
- **Data distribution shift:** Users are asking new types of questions that the existing chunks do not cover. Fix: identify the gap queries (low similarity scores), add relevant content, expand the knowledge base.
- **Embedding drift:** If you updated the embedding model or its version changed silently, old and new embeddings are incompatible. Fix: re-embed the entire corpus with the current model.

**Step 2: If retrieval quality is fine, check generation.**
- Look at cases where good chunks were retrieved but the answer still contains unsupported claims.
- Did the LLM change? (API provider may have updated the model silently.)
- Did the prompt template change? A prompt that does not strongly instruct the model to only use the provided context will lead to more hallucination.
- Is the context window being exceeded? If you are retrieving too many chunks and the prompt is very long, the model may ignore middle chunks and hallucinate.

**Possible generation fixes:**
- Strengthen the prompt: explicitly instruct "Only use information from the provided context. If the context does not contain the answer, say so."
- Reduce the number of retrieved chunks to avoid context window overflow.
- Switch to a more instruction-following model if the current one is ignoring context.

**Step 3: Check for systemic issues.**
- Did the source documents themselves change quality? (E.g., auto-generated content replaced human-written content.)
- Is a specific category of queries driving the drop? Segment faithfulness by query type to isolate the problem.

**Prevention going forward:**
- Run RAGAS evaluation on a fixed test set weekly (not just on production queries).
- Set up alerting thresholds so you catch drops early.
- Version everything: embedding model, LLM, prompt template, index. When faithfulness drops, you can diff what changed.

</details>

---

## Coding Challenges

### 17. Implement a function that performs hybrid search using BM25 and vector similarity, fusing results with Reciprocal Rank Fusion. [Intermediate]

**What they're testing:** Ability to implement core RAG infrastructure from scratch.

<details>
<summary>Answer</summary>

```python
import numpy as np
from rank_bm25 import BM25Okapi
from typing import List, Tuple, Dict


def hybrid_search(
    query: str,
    corpus: List[str],
    corpus_embeddings: np.ndarray,
    embed_fn,  # callable: str -> np.ndarray
    top_k: int = 10,
    rrf_k: int = 60,
    bm25_candidates: int = 50,
    vector_candidates: int = 50,
) -> List[Tuple[int, float]]:
    """
    Perform hybrid search combining BM25 and vector similarity with RRF fusion.

    Args:
        query: The search query string.
        corpus: List of document strings.
        corpus_embeddings: Pre-computed embeddings for all documents, shape (n_docs, dim).
        embed_fn: Function that takes a string and returns its embedding vector.
        top_k: Number of final results to return.
        rrf_k: RRF constant (default 60).
        bm25_candidates: Number of candidates from BM25.
        vector_candidates: Number of candidates from vector search.

    Returns:
        List of (doc_index, rrf_score) tuples, sorted by descending score.
    """
    # --- BM25 retrieval ---
    tokenized_corpus = [doc.lower().split() for doc in corpus]
    bm25 = BM25Okapi(tokenized_corpus)
    bm25_scores = bm25.get_scores(query.lower().split())
    bm25_top_indices = np.argsort(bm25_scores)[::-1][:bm25_candidates]
    bm25_ranked = [(int(idx), float(bm25_scores[idx])) for idx in bm25_top_indices]

    # --- Vector retrieval ---
    query_embedding = embed_fn(query)
    # Cosine similarity: dot product of normalized vectors
    norms = np.linalg.norm(corpus_embeddings, axis=1, keepdims=True)
    normalized_corpus = corpus_embeddings / (norms + 1e-10)
    query_norm = query_embedding / (np.linalg.norm(query_embedding) + 1e-10)
    similarities = normalized_corpus @ query_norm
    vector_top_indices = np.argsort(similarities)[::-1][:vector_candidates]
    vector_ranked = [(int(idx), float(similarities[idx])) for idx in vector_top_indices]

    # --- Reciprocal Rank Fusion ---
    fused_scores: Dict[int, float] = {}
    for ranked_list in [bm25_ranked, vector_ranked]:
        for rank, (doc_idx, _) in enumerate(ranked_list):
            if doc_idx not in fused_scores:
                fused_scores[doc_idx] = 0.0
            fused_scores[doc_idx] += 1.0 / (rrf_k + rank + 1)

    # Sort by fused score descending
    results = sorted(fused_scores.items(), key=lambda x: x[1], reverse=True)
    return results[:top_k]
```

**Key points to mention in an interview:**
- BM25 and vector search run independently and can be parallelized.
- RRF uses only rank positions, not raw scores, which avoids the score normalization problem.
- The `rrf_k` constant (typically 60) prevents top-ranked documents from dominating too heavily.
- In production, you would not rebuild the BM25 index on every query -- you would build it once and query it. The above is simplified for clarity.
- Corpus embeddings are pre-computed at indexing time; only the query is embedded at search time.

</details>

---

### 18. Write a RAG evaluation harness that computes retrieval precision@k and a simple faithfulness score using an LLM judge. [Advanced]

**What they're testing:** Ability to build evaluation infrastructure, not just the RAG pipeline itself.

<details>
<summary>Answer</summary>

```python
from typing import List, Dict, Any
from openai import OpenAI
import json


def precision_at_k(
    retrieved_doc_ids: List[str],
    relevant_doc_ids: List[str],
    k: int,
) -> float:
    """
    Compute precision@k: fraction of top-k retrieved docs that are relevant.
    """
    top_k = retrieved_doc_ids[:k]
    relevant_set = set(relevant_doc_ids)
    hits = sum(1 for doc_id in top_k if doc_id in relevant_set)
    return hits / k if k > 0 else 0.0


def faithfulness_score(
    question: str,
    answer: str,
    context: str,
    client: OpenAI,
    model: str = "gpt-4",
) -> Dict[str, Any]:
    """
    Use an LLM judge to evaluate faithfulness: does the answer only
    contain information supported by the context?

    Returns a dict with score (0.0-1.0), supported_claims, total_claims,
    and the judge's reasoning.
    """
    prompt = f"""You are evaluating a RAG system's answer for faithfulness.

Faithfulness means: every factual claim in the answer must be supported by
the provided context. Claims not found in the context are unfaithful.

Question: {question}

Context:
{context}

Answer to evaluate:
{answer}

Instructions:
1. List every distinct factual claim in the answer.
2. For each claim, state whether it is supported by the context (YES/NO).
3. Compute the faithfulness score: (number of supported claims) / (total claims).

Respond in this exact JSON format:
{{
  "claims": [
    {{"claim": "...", "supported": true/false}},
    ...
  ],
  "supported_count": <int>,
  "total_count": <int>,
  "score": <float between 0 and 1>,
  "reasoning": "Brief explanation of your evaluation."
}}"""

    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
        response_format={"type": "json_object"},
    )

    result = json.loads(response.choices[0].message.content)
    return result


def evaluate_rag_pipeline(
    test_cases: List[Dict],
    client: OpenAI,
    k: int = 5,
) -> Dict[str, float]:
    """
    Run evaluation over a list of test cases.

    Each test case is a dict with keys:
      - question: str
      - answer: str (system-generated answer)
      - context: str (retrieved chunks concatenated)
      - retrieved_doc_ids: List[str]
      - relevant_doc_ids: List[str] (ground truth)

    Returns aggregate metrics.
    """
    precisions = []
    faithfulness_scores = []

    for case in test_cases:
        # Retrieval metric
        p_at_k = precision_at_k(
            case["retrieved_doc_ids"],
            case["relevant_doc_ids"],
            k=k,
        )
        precisions.append(p_at_k)

        # Generation metric
        faith = faithfulness_score(
            question=case["question"],
            answer=case["answer"],
            context=case["context"],
            client=client,
        )
        faithfulness_scores.append(faith["score"])

    return {
        f"precision@{k}": sum(precisions) / len(precisions),
        "avg_faithfulness": sum(faithfulness_scores) / len(faithfulness_scores),
        "min_faithfulness": min(faithfulness_scores),
        "num_test_cases": len(test_cases),
    }
```

**Key points to mention in an interview:**
- Retrieval and generation are evaluated with separate metrics because a failure in either component manifests differently.
- The LLM judge decomposes the answer into individual claims before scoring, which is more reliable than asking for a single holistic score.
- Temperature is set to 0 for the judge to maximize consistency.
- JSON output format ensures parseable results.
- In production, you would validate the LLM judge against human annotations on a small sample (50-100 cases) to ensure it correlates with human judgment before trusting it at scale.
- This is a simplified version. RAGAS and DeepEval provide more sophisticated implementations with additional metrics.

</details>

---

## Study References

For detailed coverage of all topics above, see the full notes:

- [01 - RAG Fundamentals](../../notes/01-rag-fundamentals.md)
- [02 - Chunking Strategies](../../notes/02-chunking-strategies.md)
- [03 - Vector Database Indexing](../../notes/03-vector-db-indexing.md)
- [04 - Hybrid Search and Reranking](../../notes/04-hybrid-search-reranking.md)
- [05 - Embedding Ambiguity and Limitations](../../notes/05-embedding-ambiguity.md)
- [06 - RAG Evaluation](../../notes/06-rag-evaluation.md)
