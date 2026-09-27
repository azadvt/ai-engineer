# Chunking Strategies

> Module 03 - Phase 2: Core AI Engineering - Estimated reading: ~20 min
> Prerequisites: [01-rag-fundamentals](./01-rag-fundamentals.md)

## Why Chunking Matters

You can't throw a 200-page PDF into a vector database as a single entry. Two reasons:

1. **Context window limits** -- Even if you retrieve only 5 results, each result needs to fit within the LLM's context window alongside the prompt and other chunks. A 200-page chunk doesn't work.

2. **Retrieval precision** -- Embeddings represent the meaning of the entire text they're computed over. A huge chunk mixes many topics, so its embedding becomes a vague average of everything in it. When you search for "suspect's phone number," a 10,000-word chunk about general evidence won't match as well as a 200-word chunk that specifically contains contact details.

The goal: chunks that are small enough to be specific and retrievable, but large enough to carry meaningful context.

---

## Fixed-Size Chunking

The simplest approach. Split text every N characters or N tokens.

```python
def fixed_size_chunk(text, chunk_size=500, overlap=50):
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap  # overlap prevents cutting mid-sentence
    return chunks
```

**Overlap** is important. Without it, you'll split sentences and ideas in half. An overlap of 10-20% of chunk size is typical.

Pros:
- Dead simple to implement
- Predictable chunk sizes
- Fast

Cons:
- Cuts through sentences, paragraphs, and ideas
- No awareness of document structure
- A chunk might start mid-sentence and end mid-sentence

Use when: You need a quick baseline or the text has no meaningful structure.

---

## Recursive Character Splitting

LangChain's default and most popular approach. Instead of splitting at a fixed position, it tries a hierarchy of separators:

1. First, try to split on `\n\n` (paragraph breaks)
2. If chunks are still too big, split on `\n` (line breaks)
3. Still too big? Split on `. ` (sentences)
4. Last resort: split on ` ` (words)
5. Final fallback: split on individual characters

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    separators=["\n\n", "\n", ". ", " ", ""],
)

chunks = splitter.split_text(long_document)
```

This respects natural text boundaries. A paragraph won't be split unless it exceeds the chunk size.

Pros:
- Respects document structure better than fixed-size
- Still simple and fast
- Configurable separators for different content types

Cons:
- Still doesn't understand meaning -- it's purely structural
- Can still produce chunks that mix topics if paragraphs are long

Use when: General-purpose chunking for most text documents.

---

## Semantic Chunking

Instead of splitting by characters or structure, split by meaning. The idea: consecutive sentences that are about the same topic should stay together. When the topic shifts, start a new chunk.

How it works:
1. Split text into sentences
2. Embed each sentence
3. Compare adjacent sentence embeddings (cosine similarity)
4. When similarity drops below a threshold, that's a chunk boundary

```python
from langchain_experimental.text_splitter import SemanticChunker
from langchain_openai import OpenAIEmbeddings

splitter = SemanticChunker(
    OpenAIEmbeddings(),
    breakpoint_threshold_type="percentile",  # or "standard_deviation"
    breakpoint_threshold_amount=70,
)

chunks = splitter.split_text(document_text)
```

Pros:
- Chunks align with actual topic boundaries
- Better retrieval precision because each chunk is topically coherent

Cons:
- Requires an embedding model at chunking time (slower, costs money)
- Sensitive to threshold tuning -- too high and you get huge chunks, too low and you get tiny ones
- Doesn't guarantee consistent chunk sizes

Use when: Documents with natural topic flow (articles, reports, long-form content).

---

## Document-Aware Chunking

Use the document's own structure as chunk boundaries.

### Markdown
Split on headers. Each section becomes a chunk.

```python
from langchain.text_splitter import MarkdownHeaderTextSplitter

headers = [
    ("#", "Header 1"),
    ("##", "Header 2"),
    ("###", "Header 3"),
]
splitter = MarkdownHeaderTextSplitter(headers_to_split_on=headers)
chunks = splitter.split_text(markdown_text)
# Each chunk includes its header hierarchy as metadata
```

### HTML
Split on HTML tags (`<h1>`, `<h2>`, `<div>`, `<section>`).

### Code
Split on function/class definitions. LangChain has language-specific splitters for Python, JavaScript, etc.

### PDF / Tables
More complex. Tools like `unstructured`, `PyMuPDF`, or `docling` can parse PDFs into structured elements (paragraphs, tables, headers) that you then chunk intelligently.

Pros:
- Preserves the author's intended structure
- Headers/metadata travel with the chunk, improving retrieval

Cons:
- Only works for structured documents
- Section sizes vary wildly -- some sections are 2 lines, others are 2 pages

---

## Parent-Child / Hierarchical Chunking

The core insight: what's best for retrieval is different from what's best for generation.

- **Small chunks** (100-200 tokens) -- better for retrieval because they're specific and focused
- **Large chunks** (500-2000 tokens) -- better for generation because they provide enough context

Solution: use both.

1. Create large "parent" chunks
2. Split each parent into smaller "child" chunks
3. Embed and index the child chunks
4. At query time, retrieve matching child chunks, then return their parent chunks to the LLM

```python
from langchain.retrievers import ParentDocumentRetriever
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.storage import InMemoryStore
from langchain_community.vectorstores import Chroma

# Small chunks for retrieval
child_splitter = RecursiveCharacterTextSplitter(chunk_size=200)

# Large chunks for context
parent_splitter = RecursiveCharacterTextSplitter(chunk_size=1000)

store = InMemoryStore()  # stores parent chunks
vectorstore = Chroma(embedding_function=embeddings)

retriever = ParentDocumentRetriever(
    vectorstore=vectorstore,
    docstore=store,
    child_splitter=child_splitter,
    parent_splitter=parent_splitter,
)
```

This is one of the most effective strategies. You get precise retrieval with rich context.

---

## Agentic Chunking

Let an LLM decide where to split. You feed the document to an LLM with instructions like:

> "Read this document and split it into coherent sections. Each section should cover one topic or idea. Return the start and end positions of each section."

This is the most "intelligent" approach but also the slowest and most expensive. You're running an LLM over your entire corpus at indexing time.

Use when: High-value documents where chunking quality is critical and you can afford the cost. Legal briefs, medical records, complex technical specs.

---

## How Chunk Size Affects Retrieval

### Too Small (< 100 tokens)
- Chunks lose context. "He transferred $5000" -- who is "he"? To whom? When?
- High retrieval recall (you find relevant chunks) but low usefulness (each chunk alone means nothing)
- More chunks to process, slower retrieval

### Too Large (> 2000 tokens)
- Chunks mix topics. A single chunk covers phone numbers, addresses, AND financial records
- Embedding becomes a blurry average -- hard to match specific queries
- Fewer chunks needed, but less precise retrieval

### Sweet Spot
There's no universal answer, but practical guidelines:

| Content Type | Recommended Chunk Size | Overlap |
|-------------|----------------------|---------|
| Chat logs / short messages | 200-500 chars | 0-50 |
| Articles / reports | 500-1000 chars | 100-200 |
| Legal documents | 1000-2000 chars | 200-400 |
| Code | Function/class level | 0 |
| Q&A / FAQ | One Q&A pair per chunk | 0 |

Always measure. Run retrieval evaluations with different chunk sizes on your actual data.

---

## SHIP -- Production Patterns

Here's how this applies in real-world production systems:

In ACPIA, different evidence types need different chunking strategies:

### Chat Logs
Conversations have natural boundaries: time gaps, topic shifts, participant changes. Good approaches:
- Chunk by conversation (messages within a time window, e.g., 30 minutes)
- Chunk by participant pair (all messages between person A and person B)
- Keep individual messages as metadata but group them into contextual windows

```python
# Example: chunk chat logs by time gaps
def chunk_chat_by_time_gap(messages, gap_minutes=30):
    chunks = []
    current_chunk = []
    for msg in messages:
        if current_chunk and (msg.timestamp - current_chunk[-1].timestamp).minutes > gap_minutes:
            chunks.append(current_chunk)
            current_chunk = []
        current_chunk.append(msg)
    if current_chunk:
        chunks.append(current_chunk)
    return chunks
```

### Financial Records
Each transaction is a natural unit. Group related transactions:
- By date range
- By account/party
- By transaction type

### Legal Documents
Use document-aware chunking. Split on sections, clauses, and articles. Keep section headers as metadata so the LLM knows which part of the law is being cited.

### Images (OCR'd text)
After extracting text from images, use semantic chunking -- the extracted text often lacks structure, so meaning-based splits work better than structural ones.

The key: don't use one chunking strategy for everything. Match the strategy to the content.

Last updated: 2026-09-26
