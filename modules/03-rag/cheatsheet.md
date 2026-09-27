# RAG (Retrieval-Augmented Generation) -- Cheat Sheet

## At a Glance

RAG is a technique that retrieves relevant documents from an external knowledge base and injects them into the LLM's prompt so the model generates answers grounded in real data rather than relying solely on its training knowledge. It solves the three core LLM limitations -- knowledge cutoff, no access to private data, and hallucination -- by giving the model actual source material at query time.

---

## Key Concepts

| Concept | One-Liner | When to Use |
|---------|-----------|-------------|
| **RAG Pipeline** | Embed documents, store vectors, retrieve similar chunks at query time, augment the prompt, generate an answer. | When the LLM needs access to external, private, or frequently changing data. |
| **Chunking** | Splitting documents into smaller pieces so each piece is specific enough to retrieve and small enough to fit the context window. | Always -- you cannot embed and retrieve entire large documents effectively. |
| **Embeddings** | Numerical vector representations of text that capture semantic meaning; similar texts produce similar vectors. | To convert text into a format that enables similarity search in vector space. |
| **Vector DBs** | Specialized databases optimized for storing embeddings and performing approximate nearest-neighbor (ANN) search. | When you need fast similarity search over thousands to billions of vectors. |
| **Hybrid Search** | Combining sparse retrieval (BM25/keyword) with dense retrieval (vector/semantic) and merging results. | When queries contain exact identifiers (names, IDs, codes) alongside semantic intent. |
| **Reranking** | A second-pass scoring step using a cross-encoder that evaluates each (query, document) pair together for fine-grained relevance. | After initial retrieval to promote the most relevant chunks and demote noise before sending to the LLM. |
| **Evaluation** | Measuring retrieval quality (precision, recall, MRR) and generation quality (faithfulness, relevancy) using frameworks like RAGAS. | Continuously -- during development to tune the pipeline and in production to detect degradation. |

---

## RAG Pipeline Decision Flowchart

```
START: Do you need the LLM to use specific/private/changing data?
  |
  +-- No  --> Prompt engineering or fine-tuning may suffice. Stop.
  +-- Yes --> Proceed with RAG.
        |
        v
  STEP 1: CHUNKING
  What is your document type?
    |
    +-- Unstructured text (articles, reports) --> Recursive character splitting
    +-- Structured (Markdown, HTML, code)     --> Document-aware / header-based splitting
    +-- Mixed topics, long-form               --> Semantic chunking
    +-- High-value (legal, medical)           --> Agentic chunking (LLM-driven)
    +-- Need precise retrieval + rich context --> Parent-child (hierarchical) chunking
        |
        v
  STEP 2: EMBEDDING
  Sensitivity constraints?
    |
    +-- Data can leave your servers  --> OpenAI text-embedding-3-small (easy start)
    +-- Data must stay on-premises   --> BGE-M3 or GTE-Qwen2 (self-hosted)
    +-- Multilingual content         --> BGE-M3
        |
        v
  STEP 3: VECTOR STORE
  Scale?
    |
    +-- Prototyping / < 10K vectors       --> Chroma or FAISS
    +-- Small production / < 1M vectors   --> pgvector (if already on Postgres) or Qdrant
    +-- Medium production / 1M-100M       --> Qdrant or Weaviate
    +-- Large scale / 100M+               --> Milvus or Pinecone
        |
        v
  STEP 4: RETRIEVAL
  Query types?
    |
    +-- Purely semantic queries       --> Vector search only
    +-- Exact terms + semantic intent --> Hybrid search (BM25 + vector + RRF)
        |
        v
  STEP 5: RERANKING
  Is retrieval precision critical?
    |
    +-- No  (POC / low stakes)  --> Skip reranking, send top-k directly
    +-- Yes (production / high stakes) --> Add cross-encoder reranker
        |
        +-- API-based        --> Cohere Rerank
        +-- Self-hosted      --> BGE Reranker or ColBERT
        +-- CPU-only / light --> FlashRank
            |
            v
  STEP 6: GENERATE
  Send top 5-10 reranked chunks to the LLM with your prompt template.
        |
        v
  STEP 7: EVALUATE
  Use RAGAS (faithfulness, relevancy, context precision, context recall).
  Monitor in production with logging and alerting thresholds.
```

---

## Copy-Paste Code Patterns

### Basic RAG with LangChain

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.chains import RetrievalQA

chunks = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50).split_documents(docs)
vectorstore = Chroma.from_documents(chunks, OpenAIEmbeddings())
qa = RetrievalQA.from_chain_type(llm=ChatOpenAI(model="gpt-4"), retriever=vectorstore.as_retriever(search_kwargs={"k": 5}))
result = qa.invoke("Your question here")
```

### Hybrid Search with Weaviate

```python
results = client.query.get("Evidence", ["content", "source"]) \
    .with_hybrid(query="UPI transfer to rajesh", alpha=0.5) \
    .with_limit(10) \
    .do()
```

### Hybrid Search with Qdrant (RRF Fusion)

```python
from qdrant_client.models import Prefetch, FusionQuery

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

### Reranking with Cohere

```python
import cohere
co = cohere.Client("your-api-key")

results = co.rerank(
    query="financial transactions linked to suspect",
    documents=retrieved_chunks,
    top_n=5,
    model="rerank-english-v3.0",
)
```

### Reranking with BGE (Open Source, Local)

```python
from FlagEmbedding import FlagReranker

reranker = FlagReranker("BAAI/bge-reranker-v2-m3", use_fp16=True)
pairs = [["your query", chunk] for chunk in retrieved_chunks]
scores = reranker.compute_score(pairs)
```

### HyDE (Hypothetical Document Embedding)

```python
hypothetical = llm.generate(f"Write a short passage that answers: {query}")
hyp_vector = embedder.embed(hypothetical)
results = vectorstore.similarity_search_by_vector(hyp_vector, k=10)
```

### Evaluation with RAGAS

```python
from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevancy, context_precision, context_recall
from datasets import Dataset

eval_data = {
    "question": ["What is X?"],
    "answer": ["X is ..."],
    "contexts": [["Retrieved chunk about X ..."]],
    "ground_truth": ["X is ..."],
}
results = evaluate(Dataset.from_dict(eval_data),
    metrics=[faithfulness, answer_relevancy, context_precision, context_recall])
```

### Reciprocal Rank Fusion (Manual)

```python
def rrf(results_lists, k=60):
    scores = {}
    for results in results_lists:
        for rank, (doc_id, _) in enumerate(results):
            scores[doc_id] = scores.get(doc_id, 0) + 1 / (k + rank + 1)
    return sorted(scores.items(), key=lambda x: x[1], reverse=True)
```

---

## Comparison Tables

### Chunking Strategies

| Strategy | How It Works | Chunk Quality | Speed/Cost | Best For |
|----------|-------------|---------------|------------|----------|
| Fixed-size | Split every N characters with overlap | Low -- cuts through sentences and ideas | Very fast, free | Quick baselines, unstructured text with no meaningful structure |
| Recursive character | Try paragraph breaks, then line breaks, then sentences, then words | Medium -- respects structural boundaries | Fast, free | General-purpose default for most text documents |
| Semantic | Embed each sentence, split where cosine similarity drops | High -- aligns with topic boundaries | Slow, costs money (embedding calls) | Articles, reports, long-form content with natural topic flow |
| Document-aware | Split on headers, HTML tags, function definitions | High -- preserves author's structure | Fast, free | Markdown, HTML, code, any well-structured document |
| Parent-child | Small child chunks for retrieval, return larger parent chunks to LLM | Very high -- precise retrieval with rich context | Medium | When retrieval precision and generation quality both matter |
| Agentic (LLM-driven) | LLM reads the document and decides where to split | Highest | Very slow, expensive | High-value documents (legal, medical) where quality justifies cost |

### Chunk Size Guidelines

| Content Type | Recommended Chunk Size | Overlap |
|-------------|----------------------|---------|
| Chat logs / short messages | 200-500 chars | 0-50 |
| Articles / reports | 500-1000 chars | 100-200 |
| Legal documents | 1000-2000 chars | 200-400 |
| Code | Function/class level | 0 |
| Q&A / FAQ | One Q&A pair per chunk | 0 |

### Vector Database Comparison

| Database | Type | Index Algorithm | Strengths | Weaknesses | Best For |
|----------|------|----------------|-----------|------------|----------|
| **Chroma** | Embedded | HNSW | Simple Python API, zero setup | Not production scale | Prototyping, small projects |
| **FAISS** | Library | IVF, HNSW, PQ | Very fast, flexible, Facebook-backed | Not a DB (no persistence API, no server) | Research, custom pipelines |
| **pgvector** | Extension | IVFFlat, HNSW | SQL interface, uses existing Postgres | Slower than dedicated vector DBs | Apps already on Postgres |
| **Qdrant** | Self-hosted / Cloud | HNSW | Rust-based (fast), great filtering, good API | Smaller community | Production self-hosted, sensitive data |
| **Weaviate** | Self-hosted / Cloud | HNSW | Hybrid search built-in, modules for ML | Heavier resource use | Apps needing integrated hybrid search |
| **Milvus** | Self-hosted / Cloud | IVF, HNSW, DiskANN | Battle-tested at scale, distributed | Complex to operate | Very large scale (100M+ vectors) |
| **Pinecone** | Managed cloud | Proprietary | Easiest to start, fully managed | Vendor lock-in, expensive at scale | Teams that want zero ops |

### Embedding Model Comparison

| Model | Dimensions | Open Source | Multilingual | Best For |
|-------|-----------|-------------|-------------|----------|
| OpenAI text-embedding-3-small | 1536 (reducible) | No | Limited | Easy prototyping, general purpose |
| OpenAI text-embedding-3-large | 3072 (reducible) | No | Limited | Maximum quality via API |
| BGE-M3 (BAAI) | 1024 | Yes | Yes (strong) | Self-hosted, multilingual, production |
| E5-Mistral-7B (Microsoft) | 4096 | Yes | Limited | Instruction-tuned, highest quality open source |
| GTE-Qwen2 (Alibaba) | Varies | Yes | Yes | Good quality-size balance, self-hosted |
| Cohere embed-v3 | 1024 | No | Yes | Built-in search optimization, compression |

### Reranker Comparison

| Reranker | Type | Speed | Quality | Deployment |
|----------|------|-------|---------|------------|
| Cohere Rerank | API, cross-encoder | Fast (API) | High | Cloud API |
| BGE Reranker v2 | Cross-encoder | Medium (GPU) | High | Self-hosted |
| ColBERT | Late interaction | Fast | Medium-High | Self-hosted |
| FlashRank | Cross-encoder | Fast (CPU) | Medium | Self-hosted, CPU-only |

---

## Gotchas and Common Mistakes

1. **Using one chunking strategy for all document types.** Chat logs, legal documents, and code need different strategies. Match the chunking approach to the content.

2. **Ignoring chunk overlap.** Zero overlap means sentences and ideas get split across chunks. Use 10-20% overlap as a starting point.

3. **Relying on cosine similarity scores as confidence scores.** A score of 0.85 does not mean "85% correct." It means the vectors point in roughly the same direction, which may reflect topic similarity rather than answer correctness.

4. **Skipping hybrid search.** Pure vector search misses exact terms (names, phone numbers, case IDs, domain jargon). If your queries ever include specific identifiers, you need BM25 alongside vector search.

5. **Not reranking.** Bi-encoder retrieval is a coarse filter. Without a cross-encoder reranker, irrelevant chunks that happen to be topically similar will pollute the LLM's context.

6. **Using the wrong embedding model for your data sensitivity.** Sending private data to OpenAI's embedding API may violate compliance requirements. Self-host BGE-M3 or GTE-Qwen2 for sensitive data.

7. **Forgetting to update the index.** Documents change, but if the vector store is not re-indexed, the LLM generates answers from stale data.

8. **Embedding queries and documents with different models.** The query and document embeddings must come from the same model, or similarity scores are meaningless.

9. **Retrieving too many chunks and overflowing the context window.** More chunks is not always better. The "lost in the middle" problem means the LLM pays less attention to chunks in the middle of a long context. Retrieve fewer, more relevant chunks.

10. **Ignoring the query-document mismatch problem.** Questions and statements occupy different regions of embedding space. Techniques like HyDE, query expansion, and multi-vector retrieval specifically address this.

11. **Not evaluating.** Without metrics (RAGAS faithfulness, context precision, etc.), you have no idea if your pipeline is working or degrading. Set up evaluation from day one.

12. **Fine-tuning embeddings before fixing chunking, retrieval, and reranking.** Fine-tuning is powerful but expensive. Fix the fundamentals first -- chunking, hybrid search, reranking -- and only fine-tune when those are exhausted.

13. **Treating RAG as a one-time setup.** Production RAG systems need continuous monitoring: retrieval latency, faithfulness trends, similarity score distributions, user feedback, and embedding drift.

---

## Links to Full Notes

- [01 - RAG Fundamentals](../../notes/01-rag-fundamentals.md)
- [02 - Chunking Strategies](../../notes/02-chunking-strategies.md)
- [03 - Vector Database Indexing](../../notes/03-vector-db-indexing.md)
- [04 - Hybrid Search and Reranking](../../notes/04-hybrid-search-reranking.md)
- [05 - Embedding Ambiguity and Limitations](../../notes/05-embedding-ambiguity.md)
- [06 - RAG Evaluation](../../notes/06-rag-evaluation.md)
