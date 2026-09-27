# Vector Database Indexing

> Module 03 - Phase 2: Core AI Engineering - Estimated reading: ~20 min
> Prerequisites: [02-chunking-strategies](./02-chunking-strategies.md)

## What Vector Databases Do

A vector database stores embeddings (arrays of floats) and lets you search for vectors that are similar to a query vector. That's its core job.

Regular databases answer: "Give me rows where `name = 'Rajesh'`."
Vector databases answer: "Give me the 10 vectors closest to this query vector."

This is called similarity search, nearest-neighbor search, or ANN (Approximate Nearest Neighbor) search.

---

## How Similarity Search Works

You have a query vector and thousands (or millions) of stored vectors. You need to find the closest ones. But what does "closest" mean?

### Cosine Similarity
Measures the angle between two vectors. Ignores magnitude, only cares about direction.

```
cosine_similarity(A, B) = (A . B) / (|A| * |B|)
```

- Range: -1 to 1 (for normalized vectors: 0 to 1)
- 1 = identical direction (most similar)
- 0 = perpendicular (unrelated)
- Most commonly used for text embeddings

### Dot Product (Inner Product)
Just multiply corresponding elements and sum them.

```
dot_product(A, B) = sum(a_i * b_i)
```

- Faster than cosine (no normalization step)
- If vectors are normalized (unit length), dot product equals cosine similarity
- Most embedding models output normalized vectors, so dot product and cosine give the same ranking

### L2 / Euclidean Distance
Straight-line distance between two points in space.

```
L2(A, B) = sqrt(sum((a_i - b_i)^2))
```

- Range: 0 to infinity
- 0 = identical (most similar)
- Smaller = more similar
- Sensitive to vector magnitude, unlike cosine

**Which to use?** For text embeddings, cosine similarity or dot product (with normalized vectors). They're practically interchangeable. L2 is more common in image/audio embeddings.

---

## Indexing Algorithms

The naive approach is to compare the query vector against every stored vector (brute-force). This is exact but doesn't scale.

For 1 million vectors at 1536 dimensions: that's 1M * 1536 float comparisons per query. Too slow for production.

Solution: indexing algorithms that trade a tiny bit of accuracy for massive speed gains.

### Flat / Brute-Force
Compare against every vector. No index structure.

- Accuracy: 100% (exact nearest neighbors)
- Speed: O(n) -- linear with dataset size
- Memory: Full vectors in RAM
- Use when: Dataset < 10K vectors, or you need exact results

### IVF (Inverted File Index)
Cluster-based approach:

1. At index time: use k-means to cluster all vectors into N clusters (e.g., 256 clusters)
2. Each vector is assigned to its nearest cluster centroid
3. At query time: find the nearest M cluster centroids, then only search vectors within those clusters

```
# FAISS example
import faiss

d = 1536  # dimension
nlist = 256  # number of clusters

quantizer = faiss.IndexFlatL2(d)
index = faiss.IndexIVFFlat(quantizer, d, nlist)

index.train(vectors)  # learn cluster centroids
index.add(vectors)    # add vectors to clusters

index.nprobe = 16  # search 16 nearest clusters at query time
results = index.search(query_vector, k=10)
```

- Accuracy: ~95%+ (depending on nprobe)
- Speed: Much faster than flat -- only searches a fraction of vectors
- Trade-off: higher `nprobe` = more accurate but slower
- Use when: 100K-10M vectors, need speed, can accept approximate results

### HNSW (Hierarchical Navigable Small World)

Graph-based approach. The most popular algorithm in production vector databases.

The idea (simplified):
1. Build a multi-layer graph of vectors
2. Top layer: sparse graph with long-range connections (for fast coarse navigation)
3. Bottom layer: dense graph with short-range connections (for precise local search)
4. At query time: start at top layer, greedily navigate to the nearest node, then drop to the next layer and repeat

Think of it like Google Maps: first zoom out and pick the right city (top layer), then zoom in and navigate streets (bottom layers).

Key parameters:
- `M` -- number of connections per node (higher = more accurate but more memory)
- `ef_construction` -- search width during index building (higher = better graph quality)
- `ef_search` -- search width during queries (higher = more accurate but slower)

```python
# Qdrant example
from qdrant_client.models import VectorParams, HnswConfigDiff

client.create_collection(
    collection_name="evidence",
    vectors_config=VectorParams(
        size=1536,
        distance="Cosine",
    ),
    hnsw_config=HnswConfigDiff(
        m=16,
        ef_construct=128,
    ),
)
```

- Accuracy: 95-99%+ (best among ANN algorithms)
- Speed: Very fast, even for millions of vectors
- Memory: Higher than IVF (graph structure overhead)
- Use when: Most production use cases. Default choice.

### PQ (Product Quantization)
Compression technique, not really a search algorithm. Often combined with IVF.

1. Split each vector into sub-vectors (e.g., 1536-dim into 192 sub-vectors of 8 dims)
2. Cluster each sub-vector space independently
3. Replace each sub-vector with its cluster ID (1 byte instead of 32 bytes)
4. Store compressed vectors, decompress during search

A 1536-dim float32 vector = 6,144 bytes. With PQ (192 sub-vectors): 192 bytes. That's 32x compression.

- Accuracy: Lower than HNSW or IVF alone
- Speed: Fast (less data to move through memory)
- Memory: Dramatically reduced
- Use when: You have billions of vectors and RAM is the bottleneck

---

## Popular Vector Databases Compared

### Managed (Cloud-Hosted)

| Database | Strengths | Weaknesses | Best for |
|----------|-----------|------------|----------|
| **Pinecone** | Easiest to start, fully managed, good docs | Vendor lock-in, expensive at scale | Teams that want zero ops |
| **Weaviate Cloud** | Hybrid search built-in, GraphQL API | Learning curve | Apps needing hybrid search |

### Self-Hosted

| Database | Strengths | Weaknesses | Best for |
|----------|-----------|------------|----------|
| **Qdrant** | Rust-based (fast), great filtering, good API | Newer, smaller community | Production self-hosted |
| **Weaviate** | Hybrid search, modules for ML models | JVM-based, heavier resource use | Full-featured self-hosted |
| **Milvus** | Battle-tested at scale, distributed | Complex to operate | Very large scale |

### Lightweight / Embedded

| Database | Strengths | Weaknesses | Best for |
|----------|-----------|------------|----------|
| **Chroma** | Simple Python API, embeds in your app | Not for production scale | Prototyping, small projects |
| **FAISS** | Facebook's library, very fast, flexible | Library not a DB (no persistence API, no server) | Research, custom pipelines |
| **pgvector** | Postgres extension, SQL interface | Slower than dedicated vector DBs | Apps already using Postgres |

---

## Metadata Filtering

Vectors alone aren't enough. You often need to filter by metadata before or after similarity search.

Example in ACPIA: "Find evidence related to phone calls in March 2026."
- Vector search finds semantically similar chunks
- Metadata filter restricts to `evidence_type: "phone_records"` AND `date >= 2026-03-01`

### Pre-Filtering
Filter first, then search within the filtered set. More accurate but can be slow if the filter is very selective (tiny result set means less efficient ANN search).

### Post-Filtering
Search first (get top-100), then filter. Fast but you might end up with fewer than k results if many are filtered out.

Most production vector databases support both. Qdrant and Weaviate handle pre-filtering well.

```python
# Qdrant metadata filtering example
from qdrant_client.models import Filter, FieldCondition, MatchValue, Range

results = client.search(
    collection_name="evidence",
    query_vector=query_embedding,
    query_filter=Filter(
        must=[
            FieldCondition(key="case_id", match=MatchValue(value="CASE-2026-001")),
            FieldCondition(key="date", range=Range(gte="2026-03-01")),
        ]
    ),
    limit=10,
)
```

---

## Scaling Considerations

### Sharding
Split data across multiple nodes. Each node holds a subset of vectors. Queries go to all shards, results are merged.

### Replication
Copy data to multiple nodes. If one dies, others serve the data. Also helps with read throughput.

### Index Rebuild
When you add lots of new vectors, the index quality degrades. Some databases handle this automatically (background re-indexing), others need manual triggers.

### Memory vs Disk
HNSW needs the graph in memory. For 10M vectors at 1536 dims, that's roughly 60-80 GB RAM. Options:
- Use PQ to compress vectors
- Use memory-mapped files (slower but uses disk)
- Use a database that supports on-disk indexing (Qdrant, Milvus)

---

## SHIP -- Production Patterns

Here's how this applies in real-world production systems:

**Prototyping / hackathon**: Chroma or FAISS. Zero setup, runs in your Python process.

**Small production app (< 1M vectors)**: pgvector if you're already on Postgres. Qdrant if you want a dedicated solution.

**Medium production (1M-100M vectors)**: Qdrant or Weaviate, self-hosted or cloud.

**Large scale (100M+ vectors)**: Milvus or Pinecone (managed). You need distributed architecture.

**ACPIA specifically**: For the POC, Chroma is fine. For production with Kerala Police, a self-hosted Qdrant instance makes sense -- it's fast, handles filtering well (critical for case-specific queries), and keeps data on-premises (important for sensitive investigation data).

Last updated: 2026-09-26
