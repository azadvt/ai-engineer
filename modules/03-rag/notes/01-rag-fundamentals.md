# RAG and Retrieval Fundamentals

> Module 03 - Phase 2: Core AI Engineering - Estimated reading: ~25 min
> Prerequisites: None (entry point)

## What RAG Is

Retrieval-Augmented Generation. The name tells you the whole idea: before you let an LLM generate an answer, you retrieve relevant information and augment the prompt with it.

Why does this exist? Because LLMs have three hard limitations:

1. **Knowledge cutoff** -- The model only knows what it saw during training. GPT-4 doesn't know about something that happened last week.
2. **No access to private data** -- Your company docs, case files, internal databases -- the model has never seen them.
3. **Hallucination** -- When an LLM doesn't know something, it doesn't say "I don't know." It makes something up and says it confidently.

RAG solves all three. You give the model the actual source material at query time, so it generates answers grounded in real data.

---

## How RAG Works Step-by-Step

Here's the full pipeline, from raw documents to final answer:

### 1. Embed (Offline / Indexing Phase)
Take your documents, split them into chunks, and run each chunk through an embedding model. This converts text into numerical vectors (arrays of floats) that capture meaning.

### 2. Store
Put those vectors into a vector database (Pinecone, Qdrant, Chroma, FAISS, etc.). Each vector is stored alongside its original text and any metadata (source file, page number, date).

### 3. Query (Online / Query Phase)
When a user asks a question, embed that question using the same embedding model. Now you have a query vector.

### 4. Retrieve
Search the vector database for the chunks whose vectors are most similar to the query vector. Typically you retrieve the top-k results (k=5 to 20).

### 5. Augment
Take the retrieved chunks and stuff them into the LLM's prompt as context. A simple template:

```
Given the following context, answer the user's question.

Context:
{retrieved_chunk_1}
{retrieved_chunk_2}
{retrieved_chunk_3}

Question: {user_question}
```

### 6. Generate
The LLM reads the augmented prompt and generates an answer grounded in the retrieved context.

---

## Key Components

### Embedding Model
Converts text to vectors. Popular choices: OpenAI `text-embedding-3-small`, Cohere `embed-v3`, open-source models like `BGE-large`, `E5-mistral`, `GTE-Qwen2`.

The embedding model determines how well "similar" concepts actually land near each other in vector space. A bad embedding model makes the whole pipeline useless.

### Vector Store
Where your embeddings live. It's a specialized database optimized for similarity search over high-dimensional vectors. Not a regular SQL database.

### Retriever
The logic that takes a query, searches the vector store, and returns relevant chunks. Can be simple (nearest-neighbor search) or complex (hybrid search, reranking, multi-step retrieval).

### Generator
The LLM that produces the final answer. Could be GPT-4, Claude, Gemini, Llama, Mistral -- anything that takes a prompt and generates text.

---

## Three Generations of RAG

### Naive RAG
The basic pipeline described above. Embed, retrieve, generate. No sophistication.

Problems with naive RAG:
- Retrieves irrelevant chunks (low precision)
- Misses relevant chunks (low recall)
- LLM ignores context or hallucinates despite having context
- Chunk boundaries cut through important information

### Advanced RAG
Adds techniques before, during, and after retrieval:

- **Pre-retrieval**: Query rewriting, query expansion, HyDE (hypothetical document embeddings)
- **Retrieval**: Hybrid search (vector + keyword), metadata filtering, multi-index strategies
- **Post-retrieval**: Reranking with cross-encoders, context compression, redundancy removal

### Modular RAG
Treats the pipeline as composable modules. You can:
- Add a routing step that decides which retriever to use
- Insert a judge that decides if retrieval is even needed
- Chain multiple retrieval steps (retrieve, then retrieve again based on first results)
- Use an agent loop where the LLM decides what to retrieve next

LangGraph, LlamaIndex, and similar frameworks make modular RAG practical.

---

## RAG vs Fine-Tuning vs Prompt Engineering

| Approach | When to use | What it does |
|----------|------------|--------------|
| **Prompt Engineering** | You need the model to follow a format or tone | Changes how the model behaves, not what it knows |
| **RAG** | You need the model to use specific, possibly changing data | Gives the model external knowledge at query time |
| **Fine-Tuning** | You need the model to learn a new skill, style, or domain-specific behavior | Changes the model's weights permanently |

Rules of thumb:
- Start with prompt engineering. Always.
- Add RAG when you need external or private knowledge.
- Fine-tune only when RAG + prompt engineering aren't enough -- and you have good training data.
- You can combine all three. Fine-tune for style/behavior, RAG for knowledge, prompt engineering for formatting.

---

## Common Failure Modes

1. **Wrong chunks retrieved** -- The embedding doesn't capture what matters. "What's the suspect's phone number?" retrieves chunks about phones, not about the suspect.

2. **Right chunks retrieved, wrong answer generated** -- The LLM ignores or misreads the context. Especially common with long contexts or contradictory information.

3. **Chunk boundary problem** -- A critical piece of info is split across two chunks. Neither chunk alone makes sense.

4. **Outdated index** -- Documents changed but the vector store wasn't updated. The model answers from stale data.

5. **Context window overflow** -- You retrieve too many chunks and exceed the model's context window, or the important chunk gets lost in the middle (the "lost in the middle" problem).

6. **Embedding mismatch** -- The query is phrased as a question, but the chunks are written as statements. Their embeddings might not be similar enough.

---

## SHIP -- Production Patterns

Here's how this applies in real-world production systems:

In ACPIA, the system processes evidence from child protection investigations: chat logs, images (with OCR/descriptions), financial records, legal documents.

RAG applies directly here:

- **Case files as the knowledge base**: Each investigation has its own set of evidence documents. These get chunked, embedded, and stored.
- **Investigator queries**: "What communications happened between suspect A and the victim in March?" -- the system retrieves relevant chat log chunks and generates a summary.
- **Cross-referencing**: RAG can pull from multiple evidence types simultaneously. A query about financial transactions can retrieve both bank records and chat messages mentioning money.
- **Report generation**: When generating the final investigation report, the system retrieves all relevant evidence chunks and synthesizes them into a structured narrative.

The key insight: ACPIA doesn't need the LLM to "know" about the case. It needs the LLM to reason over the evidence it retrieves. That's exactly what RAG is for.

---

## Minimal RAG Example (Python + LangChain)

```python
from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.chains import RetrievalQA

# 1. Load documents
loader = TextLoader("evidence/chat_logs.txt")
docs = loader.load()

# 2. Chunk
splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
chunks = splitter.split_documents(docs)

# 3. Embed and store
vectorstore = Chroma.from_documents(chunks, OpenAIEmbeddings())

# 4. Build retrieval chain
retriever = vectorstore.as_retriever(search_kwargs={"k": 5})
llm = ChatOpenAI(model="gpt-4")

qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=retriever,
    return_source_documents=True,
)

# 5. Query
result = qa_chain.invoke("What phone numbers appear in the chat logs?")
print(result["result"])
```

This is naive RAG. It works for prototyping. For production, you'd add hybrid search, reranking, better chunking, evaluation, and error handling. That's what the rest of these notes cover.

Last updated: 2026-09-26
