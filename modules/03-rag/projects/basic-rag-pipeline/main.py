"""
Basic RAG Pipeline — Module 03 Project

A minimal but complete RAG system: load documents, chunk, embed, store,
retrieve, and generate answers.
"""

import argparse
import os
import sys

from dotenv import load_dotenv
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_community.vectorstores import Chroma
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter

load_dotenv()

PERSIST_DIR = "./chroma_db"
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50
TOP_K = 5


def load_documents(docs_dir: str):
    """Load all .txt and .md files from a directory."""
    loader = DirectoryLoader(
        docs_dir,
        glob="**/*.{txt,md}",
        loader_cls=TextLoader,
        loader_kwargs={"encoding": "utf-8"},
    )
    docs = loader.load()
    print(f"Loaded {len(docs)} document(s) from {docs_dir}")
    return docs


def chunk_documents(docs, chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP):
    """Split documents into chunks using recursive character splitting."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    chunks = splitter.split_documents(docs)
    print(f"Split into {len(chunks)} chunks (size={chunk_size}, overlap={chunk_overlap})")
    return chunks


def build_index(chunks):
    """Embed chunks and store in Chroma vector database."""
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=PERSIST_DIR,
    )
    print(f"Index built and persisted to {PERSIST_DIR}")
    return vectorstore


def load_index():
    """Load existing Chroma index from disk."""
    if not os.path.exists(PERSIST_DIR):
        print("No index found. Run 'index' first.")
        sys.exit(1)
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    return Chroma(persist_directory=PERSIST_DIR, embedding_function=embeddings)


def retrieve(vectorstore, query: str, k=TOP_K):
    """Retrieve top-k most similar chunks for a query."""
    results = vectorstore.similarity_search_with_score(query, k=k)
    return results


def generate_answer(query: str, chunks):
    """Generate an answer using retrieved chunks as context."""
    context = "\n\n---\n\n".join(doc.page_content for doc, _score in chunks)

    prompt = f"""Answer the question based on the provided context. If the context
doesn't contain enough information to answer, say so.

Context:
{context}

Question: {query}

Answer:"""

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    response = llm.invoke(prompt)
    return response.content


def cmd_index(args):
    """Index documents from a directory."""
    docs = load_documents(args.docs_dir)
    if not docs:
        print("No documents found.")
        return
    chunks = chunk_documents(docs)
    build_index(chunks)


def cmd_query(args):
    """Query the RAG system."""
    vectorstore = load_index()
    results = retrieve(vectorstore, args.question)

    if args.verbose:
        print("\n--- Retrieved Chunks ---")
        for i, (doc, score) in enumerate(results):
            source = doc.metadata.get("source", "unknown")
            print(f"\n[{i+1}] Score: {score:.4f} | Source: {source}")
            print(doc.page_content[:200] + "..." if len(doc.page_content) > 200 else doc.page_content)
        print("\n--- Answer ---\n")

    answer = generate_answer(args.question, results)
    print(answer)


def main():
    parser = argparse.ArgumentParser(description="Basic RAG Pipeline")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # Index command
    idx_parser = subparsers.add_parser("index", help="Index documents")
    idx_parser.add_argument("--docs-dir", required=True, help="Directory containing documents")

    # Query command
    q_parser = subparsers.add_parser("query", help="Ask a question")
    q_parser.add_argument("question", help="The question to ask")
    q_parser.add_argument("--verbose", "-v", action="store_true", help="Show retrieved chunks")

    args = parser.parse_args()

    if args.command == "index":
        cmd_index(args)
    elif args.command == "query":
        cmd_query(args)


if __name__ == "__main__":
    main()
