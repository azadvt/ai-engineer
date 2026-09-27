# Embedding Ambiguity and Limitations

> Module 03 - Phase 2: Core AI Engineering - Estimated reading: ~20 min
> Prerequisites: [01-rag-fundamentals](./01-rag-fundamentals.md)

## What Embeddings Actually Capture

An embedding is a list of floating-point numbers (a vector) that represents a piece of text in high-dimensional space. Texts with similar meanings end up near each other; unrelated texts end up far apart.

```python
from openai import OpenAI
client = OpenAI()

response = client.embeddings.create(
    input="The suspect transferred funds via UPI",
    model="text-embedding-3-small"
)
vector = response.data[0].embedding
# [0.0123, -0.0456, 0.0789, ...] -- 1536 numbers for this model
```

What embeddings capture well:
- Topic similarity ("dog" is near "puppy", "canine", "pet")
- Semantic relatedness ("doctor" is near "hospital", "patient", "treatment")
- Paraphrase detection ("send money" is near "transfer funds")

But embeddings have real blind spots. Understanding these is critical for building reliable RAG systems.

---

## What Embeddings Miss

### Negation
"The suspect IS guilty" and "The suspect is NOT guilty" are very similar in embedding space. They share almost all the same words and structure. The embedding model often doesn't weight "not" heavily enough.

This is a known, fundamental problem. Embeddings capture topic, not logical meaning.

### Exact Numbers
"The transaction was $5,000" and "The transaction was $50,000" will have very similar embeddings. The model understands "transaction" and "dollar amount" but doesn't reliably distinguish the actual numbers.

### Temporal Information
"The event happened in January" and "The event happened in December" -- similar embeddings. Time is poorly represented in most embedding spaces.

### Logical Relationships
"A caused B" vs "B caused A" -- similar embeddings, opposite meanings. Embeddings capture that A, B, and causation are all present, but not the direction.

### Entity-Specific Facts
"Rajesh lives in Kochi" and "Suresh lives in Kochi" -- very similar embeddings. The model sees "person lives in Kochi" and doesn't strongly differentiate which person.

---

## The "Bank" Problem

The classic example of semantic ambiguity:

- "I went to the bank to deposit money" (financial institution)
- "I sat on the river bank" (edge of a river)
- "The plane banked left" (aviation maneuver)

Modern embedding models handle this better than older ones because they use contextual embeddings -- the whole sentence determines the vector, not just the individual word. But they still struggle with:

- Less common meanings of words
- Domain-specific jargon that overlaps with common words
- Short texts where there isn't enough context to disambiguate

In ACPIA, "abuse" could mean child abuse (the investigation context), substance abuse, or even verbal abuse. The embedding model needs enough surrounding context to place the vector correctly.

---

## Query-Document Mismatch

This is subtle and important.

A user asks: **"What is the suspect's phone number?"**

The relevant document says: **"Contact: +91 94956 73201 (Rajesh Menon)"**

These two texts are semantically related but structurally different. One is a question, the other is a statement/data point. Their embeddings may not be as similar as you'd expect because:

- Questions and answers occupy different regions in embedding space
- The question uses words like "what", "is", "the" -- the document has none of these
- The document is a data fragment, not a natural language sentence

This is why naive RAG often fails on factual lookup queries. The question and the answer look different to the embedding model.

---

## Embedding Model Differences

Not all embedding models are equal. They differ in architecture, training data, dimension size, and what they're optimized for.

### OpenAI text-embedding-3-small / text-embedding-3-large
- Dimensions: 1536 / 3072 (with native dimension reduction support)
- Strengths: Good general-purpose, easy API
- Weaknesses: Closed source, requires API calls, costs money
- Note: You can reduce dimensions at query time (e.g., use 512 dims from the 1536-dim model) with minimal quality loss

### BGE (BAAI General Embedding)
- Models: bge-small, bge-base, bge-large, bge-m3 (multilingual)
- Dimensions: 384 / 768 / 1024
- Strengths: Open source, strong multilingual support (bge-m3), can run locally
- Weaknesses: Needs GPU for fast inference at scale

### E5 (Microsoft)
- Models: e5-small, e5-base, e5-large, e5-mistral-7b
- Dimensions: 384 / 768 / 1024 / 4096
- Strengths: Instruction-tuned variants understand query intent
- Note: E5 models expect a prefix like "query: " or "passage: " for best results

### Cohere embed-v3
- Dimensions: 1024
- Strengths: Built-in search/classification optimization, compression types
- Weaknesses: API-only, paid

### GTE (Alibaba)
- Models: gte-small, gte-base, gte-large, gte-Qwen2
- Good balance of quality and size
- Open source

### How to Choose
For prototyping: OpenAI `text-embedding-3-small` (easy, good enough).
For production with data sensitivity: `bge-m3` or `gte-Qwen2` (self-hosted, no data leaves your servers).
For multilingual: `bge-m3` is the current leader.

Always benchmark on your actual data. MTEB leaderboard (https://huggingface.co/spaces/mteb/leaderboard) ranks models, but your domain-specific performance may differ.

---

## Dimensionality and Its Trade-offs

Higher dimensions = more information capacity = better similarity discrimination.

But:
- More dimensions = more storage (each float is 4 bytes)
- More dimensions = slower search (more computations per comparison)
- Diminishing returns: 1536 dims is not 4x better than 384 dims

| Dimensions | Storage per vector | Typical use |
|-----------|-------------------|-------------|
| 384 | 1.5 KB | Small/fast models, constrained environments |
| 768 | 3 KB | Good balance for most applications |
| 1024 | 4 KB | High-quality general purpose |
| 1536 | 6 KB | OpenAI's standard |
| 3072+ | 12+ KB | Maximum quality, high cost |

For 1 million vectors at 1536 dims: ~6 GB storage just for vectors (before index overhead).

OpenAI's Matryoshka representation learning lets you truncate 1536-dim vectors to 512 or 256 dims with controlled quality loss. This is useful for reducing storage while keeping most of the retrieval quality.

---

## Multilingual Embeddings

Models like `bge-m3` and Cohere `embed-v3` support multiple languages. A query in English can match a document in Hindi or Malayalam.

Challenges:
- Quality varies by language. English is always best. Low-resource languages (like Malayalam) may perform significantly worse.
- Code-switching (mixing languages in one text, common in Indian chat logs) confuses most models.
- Transliteration (Malayalam written in English script) is poorly handled.

For ACPIA, this matters. Chat logs from Indian suspects may mix English, Hindi, and Malayalam, sometimes in the same message. Strategy:
- Use a multilingual model
- Consider translating non-English text to English before embedding
- Test retrieval quality on actual multilingual samples from your domain

---

## When Embeddings Fail Silently

The dangerous case: the system returns a high cosine similarity score, but the retrieved chunk is wrong.

Examples:
- Query: "Was the suspect in Bangalore on March 15?" Retrieved: a chunk about someone else in Bangalore on a different date. Similarity: 0.89.
- Query: "How much money was transferred?" Retrieved: a chunk discussing transfer protocols. Similarity: 0.85.

The system looks confident. The investigator trusts it. The answer is wrong.

This is why you can't rely on similarity scores alone. A score of 0.85 doesn't mean "85% correct." It means the vectors point in roughly the same direction, which could mean similar topic, not correct answer.

---

## Strategies to Handle Ambiguity

### Query Expansion
Generate multiple versions of the query and search with all of them:

```python
def expand_query(original_query, llm):
    prompt = f"""Generate 3 alternative phrasings of this search query.
    Keep the same meaning but use different words.
    Original: {original_query}"""
    alternatives = llm.generate(prompt)
    return [original_query] + alternatives

# Search with each expanded query, merge results
```

### HyDE (Hypothetical Document Embedding)
Instead of embedding the query, ask the LLM to generate a hypothetical answer, then embed that answer and search with it.

Why? The hypothetical answer looks like a document (statement-form), so it matches better against stored documents (also statement-form). Solves the query-document mismatch.

```python
def hyde_search(query, llm, embedder, vectorstore):
    # Step 1: Generate hypothetical answer
    hypothetical = llm.generate(
        f"Write a short passage that answers this question: {query}"
    )
    # Step 2: Embed the hypothetical answer (not the original query)
    hyp_vector = embedder.embed(hypothetical)
    # Step 3: Search with the hypothetical embedding
    results = vectorstore.similarity_search_by_vector(hyp_vector, k=10)
    return results
```

### Multi-Vector Retrieval
Create multiple embeddings per chunk:
- Embed the chunk itself
- Generate a summary, embed that
- Generate questions the chunk could answer, embed those

At query time, search across all vectors. A question-query matches better against question-vectors than against passage-vectors.

### Metadata Filtering
Don't rely only on embeddings. Use metadata to filter:
- Date ranges for temporal queries
- Entity names for person-specific queries
- Document types for format-specific queries

Combine metadata filtering with vector search. Let exact matches handle what embeddings can't.

---

## Fine-Tuning Embeddings for Your Domain

When off-the-shelf models don't work well enough on your specific data, you can fine-tune.

What you need:
- Pairs of (query, relevant_document) -- positive pairs
- Optionally: (query, irrelevant_document) -- negative pairs
- A base model to fine-tune (BGE, E5, or similar)

```python
# Using sentence-transformers for fine-tuning
from sentence_transformers import SentenceTransformer, InputExample, losses
from torch.utils.data import DataLoader

model = SentenceTransformer("BAAI/bge-base-en-v1.5")

train_examples = [
    InputExample(texts=["suspect's phone number", "+91 94956 73201 Rajesh Menon"], label=1.0),
    InputExample(texts=["suspect's phone number", "phone was found at the scene"], label=0.2),
    # ... hundreds or thousands of examples
]

train_dataloader = DataLoader(train_examples, shuffle=True, batch_size=16)
train_loss = losses.CosineSimilarityLoss(model)

model.fit(
    train_objectives=[(train_dataloader, train_loss)],
    epochs=3,
    warmup_steps=100,
)
```

When to fine-tune:
- Your domain has specialized vocabulary (legal, medical, law enforcement)
- Off-the-shelf models consistently retrieve wrong chunks
- You have at least 500-1000 training pairs

When NOT to fine-tune:
- You haven't tried query expansion, HyDE, or hybrid search yet
- Your retrieval problems are actually chunking problems
- You don't have good training data

Fine-tuning is powerful but it's not the first lever to pull. Fix chunking, add hybrid search, and try reranking before fine-tuning your embedding model.

Last updated: 2026-09-26
