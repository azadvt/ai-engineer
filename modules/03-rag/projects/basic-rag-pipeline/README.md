# Basic RAG Pipeline

A minimal, runnable RAG (Retrieval-Augmented Generation) pipeline that demonstrates the core concepts from Module 03.

## What It Builds

A command-line Q&A system that:
1. Loads text documents from a directory
2. Chunks them using recursive character splitting
3. Embeds chunks and stores them in a local vector database (Chroma)
4. Answers questions by retrieving relevant chunks and generating responses

## Learning Objectives

- Understand the full RAG pipeline end-to-end
- Practice chunking, embedding, and retrieval
- See how retrieval quality affects generation quality
- Experiment with different chunk sizes and retrieval parameters

## Prerequisites

- Python 3.9+
- An OpenAI API key (for embeddings and generation)

## Setup

```bash
cd modules/03-rag/projects/basic-rag-pipeline
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

## Usage

```bash
# Index documents from a directory
python main.py index --docs-dir ./sample-docs

# Ask a question
python main.py query "What are the main chunking strategies?"

# Ask with verbose mode to see retrieved chunks
python main.py query "What are the main chunking strategies?" --verbose
```

## What You'll Learn

| Concept | Where in Code |
|---------|--------------|
| Document loading | `load_documents()` |
| Chunking with overlap | `chunk_documents()` |
| Embedding + vector store | `build_index()` |
| Retrieval | `retrieve()` |
| Prompt augmentation | `generate_answer()` |
| End-to-end pipeline | `main()` |

## Next Steps

After running this basic pipeline, try:
- Changing `chunk_size` and `chunk_overlap` — how does it affect answers?
- Adding metadata filtering
- Implementing hybrid search (add BM25 alongside vector search)
- Adding a reranker
- Evaluating with RAGAS
