const NOTES = {
"3-1": `<h1>RAG and Retrieval Fundamentals</h1>
<h2>What RAG Is</h2>
<p>Retrieval-Augmented Generation. The name tells you the whole idea: before you let an LLM generate an answer, you retrieve relevant information and augment the prompt with it.</p>
<p>Why does this exist? Because LLMs have three hard limitations:</p>
<ol>
<li><strong>Knowledge cutoff</strong> -- The model only knows what it saw during training. GPT-4 doesn't know about something that happened last week.</li>
<li><strong>No access to private data</strong> -- Your company docs, case files, internal databases -- the model has never seen them.</li>
<li><strong>Hallucination</strong> -- When an LLM doesn't know something, it doesn't say "I don't know." It makes something up and says it confidently.</li>
</ol>
<p>RAG solves all three. You give the model the actual source material at query time, so it generates answers grounded in real data.</p>
<hr>
<h2>How RAG Works Step-by-Step</h2>
<h3>1. Embed (Offline / Indexing Phase)</h3>
<p>Take your documents, split them into chunks, and run each chunk through an embedding model. This converts text into numerical vectors (arrays of floats) that capture meaning.</p>
<h3>2. Store</h3>
<p>Put those vectors into a vector database (Pinecone, Qdrant, Chroma, FAISS, etc.). Each vector is stored alongside its original text and any metadata (source file, page number, date).</p>
<h3>3. Query (Online / Query Phase)</h3>
<p>When a user asks a question, embed that question using the same embedding model. Now you have a query vector.</p>
<h3>4. Retrieve</h3>
<p>Search the vector database for the chunks whose vectors are most similar to the query vector. Typically you retrieve the top-k results (k=5 to 20).</p>
<h3>5. Augment</h3>
<p>Take the retrieved chunks and stuff them into the LLM's prompt as context:</p>
<pre><code>Given the following context, answer the user's question.

Context:
{retrieved_chunk_1}
{retrieved_chunk_2}
{retrieved_chunk_3}

Question: {user_question}</code></pre>
<h3>6. Generate</h3>
<p>The LLM reads the augmented prompt and generates an answer grounded in the retrieved context.</p>
<hr>
<h2>Key Components</h2>
<h3>Embedding Model</h3>
<p>Converts text to vectors. Popular choices: OpenAI <code>text-embedding-3-small</code>, Cohere <code>embed-v3</code>, open-source models like <code>BGE-large</code>, <code>E5-mistral</code>, <code>GTE-Qwen2</code>.</p>
<p>The embedding model determines how well "similar" concepts actually land near each other in vector space. A bad embedding model makes the whole pipeline useless.</p>
<h3>Vector Store</h3>
<p>Where your embeddings live. It's a specialized database optimized for similarity search over high-dimensional vectors. Not a regular SQL database.</p>
<h3>Retriever</h3>
<p>The logic that takes a query, searches the vector store, and returns relevant chunks. Can be simple (nearest-neighbor search) or complex (hybrid search, reranking, multi-step retrieval).</p>
<h3>Generator</h3>
<p>The LLM that produces the final answer. Could be GPT-4, Claude, Gemini, Llama, Mistral -- anything that takes a prompt and generates text.</p>
<hr>
<h2>Three Generations of RAG</h2>
<h3>Naive RAG</h3>
<p>The basic pipeline described above. Embed, retrieve, generate. No sophistication.</p>
<p>Problems with naive RAG:</p>
<ul>
<li>Retrieves irrelevant chunks (low precision)</li>
<li>Misses relevant chunks (low recall)</li>
<li>LLM ignores context or hallucinates despite having context</li>
<li>Chunk boundaries cut through important information</li>
</ul>
<h3>Advanced RAG</h3>
<p>Adds techniques before, during, and after retrieval:</p>
<ul>
<li><strong>Pre-retrieval</strong>: Query rewriting, query expansion, HyDE (hypothetical document embeddings)</li>
<li><strong>Retrieval</strong>: Hybrid search (vector + keyword), metadata filtering, multi-index strategies</li>
<li><strong>Post-retrieval</strong>: Reranking with cross-encoders, context compression, redundancy removal</li>
</ul>
<h3>Modular RAG</h3>
<p>Treats the pipeline as composable modules. You can add routing (decide which retriever to use), insert a judge (decide if retrieval is even needed), chain multiple retrieval steps, or use an agent loop where the LLM decides what to retrieve next.</p>
<p>LangGraph, LlamaIndex, and similar frameworks make modular RAG practical.</p>
<hr>
<h2>RAG vs Fine-Tuning vs Prompt Engineering</h2>
<table>
<tr><th>Approach</th><th>When to use</th><th>What it does</th></tr>
<tr><td><strong>Prompt Engineering</strong></td><td>You need the model to follow a format or tone</td><td>Changes how the model behaves, not what it knows</td></tr>
<tr><td><strong>RAG</strong></td><td>You need the model to use specific, possibly changing data</td><td>Gives the model external knowledge at query time</td></tr>
<tr><td><strong>Fine-Tuning</strong></td><td>You need the model to learn a new skill, style, or domain-specific behavior</td><td>Changes the model's weights permanently</td></tr>
</table>
<p>Rules of thumb:</p>
<ul>
<li>Start with prompt engineering. Always.</li>
<li>Add RAG when you need external or private knowledge.</li>
<li>Fine-tune only when RAG + prompt engineering aren't enough -- and you have good training data.</li>
<li>You can combine all three. Fine-tune for style/behavior, RAG for knowledge, prompt engineering for formatting.</li>
</ul>
<hr>
<h2>Common Failure Modes</h2>
<ol>
<li><strong>Wrong chunks retrieved</strong> -- The embedding doesn't capture what matters. "What's the suspect's phone number?" retrieves chunks about phones, not about the suspect.</li>
<li><strong>Right chunks retrieved, wrong answer generated</strong> -- The LLM ignores or misreads the context. Especially common with long contexts or contradictory information.</li>
<li><strong>Chunk boundary problem</strong> -- A critical piece of info is split across two chunks. Neither chunk alone makes sense.</li>
<li><strong>Outdated index</strong> -- Documents changed but the vector store wasn't updated. The model answers from stale data.</li>
<li><strong>Context window overflow</strong> -- You retrieve too many chunks and exceed the model's context window, or the important chunk gets lost in the middle.</li>
<li><strong>Embedding mismatch</strong> -- The query is phrased as a question, but the chunks are written as statements. Their embeddings might not be similar enough.</li>
</ol>
<hr>
<h2>ACPIA Connection</h2>
<p>In ACPIA, the system processes evidence from child protection investigations: chat logs, images (with OCR/descriptions), financial records, legal documents.</p>
<ul>
<li><strong>Case files as the knowledge base</strong>: Each investigation has its own set of evidence documents. These get chunked, embedded, and stored.</li>
<li><strong>Investigator queries</strong>: "What communications happened between suspect A and the victim in March?" -- the system retrieves relevant chat log chunks and generates a summary.</li>
<li><strong>Cross-referencing</strong>: RAG can pull from multiple evidence types simultaneously.</li>
<li><strong>Report generation</strong>: When generating the final investigation report, the system retrieves all relevant evidence chunks and synthesizes them into a structured narrative.</li>
</ul>
<p>The key insight: ACPIA doesn't need the LLM to "know" about the case. It needs the LLM to reason over the evidence it retrieves. That's exactly what RAG is for.</p>
<hr>
<h2>Minimal RAG Example (Python + LangChain)</h2>
<pre><code>from langchain_community.document_loaders import TextLoader
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
print(result["result"])</code></pre>
<p>This is naive RAG. It works for prototyping. For production, you'd add hybrid search, reranking, better chunking, evaluation, and error handling.</p>`,

"3-2": `<h1>Chunking Strategies</h1>
<h2>Why Chunking Matters</h2>
<p>You can't throw a 200-page PDF into a vector database as a single entry. Two reasons:</p>
<ol>
<li><strong>Context window limits</strong> -- Even if you retrieve only 5 results, each result needs to fit within the LLM's context window alongside the prompt and other chunks.</li>
<li><strong>Retrieval precision</strong> -- Embeddings represent the meaning of the entire text they're computed over. A huge chunk mixes many topics, so its embedding becomes a vague average. A 200-word chunk that specifically contains contact details matches much better than a 10,000-word chunk about general evidence.</li>
</ol>
<p>The goal: chunks that are small enough to be specific and retrievable, but large enough to carry meaningful context.</p>
<hr>
<h2>Fixed-Size Chunking</h2>
<p>The simplest approach. Split text every N characters or N tokens.</p>
<pre><code>def fixed_size_chunk(text, chunk_size=500, overlap=50):
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap
    return chunks</code></pre>
<p><strong>Overlap</strong> is important. Without it, you'll split sentences and ideas in half. An overlap of 10-20% of chunk size is typical.</p>
<p>Pros: Dead simple, predictable sizes, fast.</p>
<p>Cons: Cuts through sentences, paragraphs, and ideas. No awareness of document structure.</p>
<p>Use when: You need a quick baseline or the text has no meaningful structure.</p>
<hr>
<h2>Recursive Character Splitting</h2>
<p>LangChain's default and most popular approach. Instead of splitting at a fixed position, it tries a hierarchy of separators:</p>
<ol>
<li>First, try to split on <code>\\n\\n</code> (paragraph breaks)</li>
<li>If chunks are still too big, split on <code>\\n</code> (line breaks)</li>
<li>Still too big? Split on <code>. </code> (sentences)</li>
<li>Last resort: split on <code> </code> (words)</li>
</ol>
<pre><code>from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    separators=["\\n\\n", "\\n", ". ", " ", ""],
)
chunks = splitter.split_text(long_document)</code></pre>
<p>This respects natural text boundaries. A paragraph won't be split unless it exceeds the chunk size.</p>
<p>Use when: General-purpose chunking for most text documents.</p>
<hr>
<h2>Semantic Chunking</h2>
<p>Split by meaning instead of structure. Consecutive sentences about the same topic stay together. When the topic shifts, start a new chunk.</p>
<p>How it works:</p>
<ol>
<li>Split text into sentences</li>
<li>Embed each sentence</li>
<li>Compare adjacent sentence embeddings (cosine similarity)</li>
<li>When similarity drops below a threshold, that's a chunk boundary</li>
</ol>
<pre><code>from langchain_experimental.text_splitter import SemanticChunker
from langchain_openai import OpenAIEmbeddings

splitter = SemanticChunker(
    OpenAIEmbeddings(),
    breakpoint_threshold_type="percentile",
    breakpoint_threshold_amount=70,
)
chunks = splitter.split_text(document_text)</code></pre>
<p>Pros: Chunks align with actual topic boundaries. Better retrieval precision.</p>
<p>Cons: Requires an embedding model at chunking time (slower, costs money). Sensitive to threshold tuning.</p>
<hr>
<h2>Document-Aware Chunking</h2>
<p>Use the document's own structure as chunk boundaries.</p>
<ul>
<li><strong>Markdown</strong>: Split on headers. Each section becomes a chunk.</li>
<li><strong>HTML</strong>: Split on HTML tags (<code>&lt;h1&gt;</code>, <code>&lt;h2&gt;</code>, <code>&lt;div&gt;</code>).</li>
<li><strong>Code</strong>: Split on function/class definitions.</li>
<li><strong>PDF / Tables</strong>: Tools like <code>unstructured</code>, <code>PyMuPDF</code>, or <code>docling</code> can parse PDFs into structured elements.</li>
</ul>
<p>Pros: Preserves the author's intended structure. Headers/metadata travel with the chunk.</p>
<p>Cons: Only works for structured documents. Section sizes vary wildly.</p>
<hr>
<h2>Parent-Child / Hierarchical Chunking</h2>
<p>The core insight: what's best for retrieval is different from what's best for generation.</p>
<ul>
<li><strong>Small chunks</strong> (100-200 tokens) -- better for retrieval because they're specific and focused</li>
<li><strong>Large chunks</strong> (500-2000 tokens) -- better for generation because they provide enough context</li>
</ul>
<p>Solution: use both.</p>
<ol>
<li>Create large "parent" chunks</li>
<li>Split each parent into smaller "child" chunks</li>
<li>Embed and index the child chunks</li>
<li>At query time, retrieve matching child chunks, then return their parent chunks to the LLM</li>
</ol>
<pre><code>from langchain.retrievers import ParentDocumentRetriever
from langchain.text_splitter import RecursiveCharacterTextSplitter

child_splitter = RecursiveCharacterTextSplitter(chunk_size=200)
parent_splitter = RecursiveCharacterTextSplitter(chunk_size=1000)

retriever = ParentDocumentRetriever(
    vectorstore=vectorstore,
    docstore=store,
    child_splitter=child_splitter,
    parent_splitter=parent_splitter,
)</code></pre>
<p>This is one of the most effective strategies. You get precise retrieval with rich context.</p>
<hr>
<h2>Agentic Chunking</h2>
<p>Let an LLM decide where to split. Feed the document to an LLM with instructions like: "Read this document and split it into coherent sections."</p>
<p>Most "intelligent" approach but also the slowest and most expensive. Use when: High-value documents where chunking quality is critical (legal briefs, medical records).</p>
<hr>
<h2>Chunk Size Guidelines</h2>
<table>
<tr><th>Content Type</th><th>Recommended Size</th><th>Overlap</th></tr>
<tr><td>Chat logs / short messages</td><td>200-500 chars</td><td>0-50</td></tr>
<tr><td>Articles / reports</td><td>500-1000 chars</td><td>100-200</td></tr>
<tr><td>Legal documents</td><td>1000-2000 chars</td><td>200-400</td></tr>
<tr><td>Code</td><td>Function/class level</td><td>0</td></tr>
<tr><td>Q&A / FAQ</td><td>One Q&A pair per chunk</td><td>0</td></tr>
</table>
<p><strong>Too small (&lt;100 tokens)</strong>: Loses context. "He transferred $5000" -- who is "he"?</p>
<p><strong>Too large (&gt;2000 tokens)</strong>: Embedding becomes a blurry average. Less precise retrieval.</p>
<p>Always measure. Run retrieval evaluations with different chunk sizes on your actual data.</p>
<hr>
<h2>ACPIA: Chunking Different Evidence Types</h2>
<p><strong>Chat Logs:</strong> Chunk by conversation (time gaps), by participant pair, or by contextual windows.</p>
<p><strong>Financial Records:</strong> Each transaction is a natural unit. Group by date range, account, or transaction type.</p>
<p><strong>Legal Documents:</strong> Split on sections, clauses, articles. Keep section headers as metadata.</p>
<p><strong>Images (OCR'd text):</strong> Use semantic chunking -- extracted text often lacks structure.</p>
<p>The key: don't use one chunking strategy for everything. Match the strategy to the content.</p>`,

"3-3": `<h1>Vector Database Indexing</h1>
<h2>What Vector Databases Do</h2>
<p>A vector database stores embeddings (arrays of floats) and lets you search for vectors that are similar to a query vector.</p>
<p>Regular databases answer: "Give me rows where <code>name = 'Rajesh'</code>."<br>Vector databases answer: "Give me the 10 vectors closest to this query vector."</p>
<hr>
<h2>How Similarity Search Works</h2>
<h3>Cosine Similarity</h3>
<p>Measures the angle between two vectors. Ignores magnitude, only cares about direction.</p>
<pre><code>cosine_similarity(A, B) = (A . B) / (|A| * |B|)</code></pre>
<ul>
<li>Range: -1 to 1 (for normalized vectors: 0 to 1)</li>
<li>1 = identical direction (most similar)</li>
<li>Most commonly used for text embeddings</li>
</ul>
<h3>Dot Product</h3>
<p>Multiply corresponding elements and sum them. Faster than cosine (no normalization). If vectors are normalized, dot product equals cosine similarity.</p>
<h3>L2 / Euclidean Distance</h3>
<p>Straight-line distance between two points. Sensitive to vector magnitude, unlike cosine. More common in image/audio embeddings.</p>
<hr>
<h2>Indexing Algorithms</h2>
<h3>Flat / Brute-Force</h3>
<p>Compare against every vector. 100% accurate, O(n) speed. Use when dataset &lt; 10K vectors.</p>
<h3>IVF (Inverted File Index)</h3>
<p>Cluster-based approach:</p>
<ol>
<li>Use k-means to cluster all vectors into N clusters</li>
<li>Each vector is assigned to its nearest cluster centroid</li>
<li>At query time, find the nearest M cluster centroids, then only search vectors within those clusters</li>
</ol>
<pre><code>import faiss

d = 1536  # dimension
nlist = 256  # number of clusters

quantizer = faiss.IndexFlatL2(d)
index = faiss.IndexIVFFlat(quantizer, d, nlist)
index.train(vectors)
index.add(vectors)

index.nprobe = 16  # search 16 nearest clusters
results = index.search(query_vector, k=10)</code></pre>
<p>Accuracy ~95%+. Trade-off: higher <code>nprobe</code> = more accurate but slower. Use for 100K-10M vectors.</p>
<h3>HNSW (Hierarchical Navigable Small World)</h3>
<p>Graph-based approach. The most popular algorithm in production.</p>
<ol>
<li>Build a multi-layer graph of vectors</li>
<li>Top layer: sparse graph with long-range connections (fast coarse navigation)</li>
<li>Bottom layer: dense graph with short-range connections (precise local search)</li>
<li>At query time: start at top layer, greedily navigate to nearest node, drop to next layer</li>
</ol>
<p>Think of it like Google Maps: first zoom out and pick the right city (top layer), then zoom in and navigate streets (bottom layers).</p>
<p>Key parameters: <code>M</code> (connections per node), <code>ef_construction</code> (build quality), <code>ef_search</code> (query accuracy vs speed).</p>
<p>Accuracy: 95-99%+. Default choice for most production use cases.</p>
<h3>PQ (Product Quantization)</h3>
<p>Compression technique. Split each vector into sub-vectors, cluster each independently, replace with cluster IDs.</p>
<p>A 1536-dim float32 vector = 6,144 bytes. With PQ: ~192 bytes. That's 32x compression.</p>
<p>Use when you have billions of vectors and RAM is the bottleneck.</p>
<hr>
<h2>Vector Databases Compared</h2>
<table>
<tr><th>Database</th><th>Type</th><th>Best For</th></tr>
<tr><td><strong>Pinecone</strong></td><td>Managed cloud</td><td>Teams wanting zero ops</td></tr>
<tr><td><strong>Qdrant</strong></td><td>Self-hosted (Rust)</td><td>Production self-hosted, great filtering</td></tr>
<tr><td><strong>Weaviate</strong></td><td>Self-hosted/cloud</td><td>Built-in hybrid search</td></tr>
<tr><td><strong>Milvus</strong></td><td>Self-hosted</td><td>Very large scale (100M+ vectors)</td></tr>
<tr><td><strong>Chroma</strong></td><td>Embedded</td><td>Prototyping, small projects</td></tr>
<tr><td><strong>FAISS</strong></td><td>Library</td><td>Research, custom pipelines</td></tr>
<tr><td><strong>pgvector</strong></td><td>Postgres extension</td><td>Apps already using Postgres</td></tr>
</table>
<hr>
<h2>Metadata Filtering</h2>
<p>Vectors alone aren't enough. Filter by metadata before or after similarity search.</p>
<p><strong>Pre-filtering:</strong> Filter first, then search within filtered set. More accurate.</p>
<p><strong>Post-filtering:</strong> Search first, then filter results. Faster but might return fewer results than needed.</p>
<pre><code>from qdrant_client.models import Filter, FieldCondition, MatchValue, Range

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
)</code></pre>
<hr>
<h2>Scaling</h2>
<ul>
<li><strong>Sharding</strong>: Split data across multiple nodes</li>
<li><strong>Replication</strong>: Copy data for redundancy and read throughput</li>
<li><strong>Memory vs Disk</strong>: HNSW needs the graph in memory. For 10M vectors at 1536 dims, that's ~60-80 GB RAM. Options: PQ compression, memory-mapped files, on-disk indexing</li>
</ul>
<p><strong>ACPIA specifically:</strong> POC: Chroma is fine. Production: self-hosted Qdrant -- fast, handles filtering well, keeps data on-premises (important for sensitive investigation data).</p>`,

"3-4": `<h1>Hybrid Search and Reranking</h1>
<h2>The Problem with Pure Vector Search</h2>
<p>Vector search finds semantically similar results. That sounds great until you hit these cases:</p>
<ol>
<li><strong>Keyword misses</strong> -- User searches for "UPI ID rajesh.m@ybl". Vector search looks for meaning, not exact strings.</li>
<li><strong>Semantic drift</strong> -- "apple fruit nutrition" and "apple company stock" are both "about apple."</li>
<li><strong>Exact match failures</strong> -- Case numbers, phone numbers, account numbers. Vector search doesn't reliably match exact strings.</li>
<li><strong>Rare terms</strong> -- Domain-specific jargon. If the embedding model didn't see "POCSO" enough during training, it won't embed it meaningfully.</li>
</ol>
<hr>
<h2>Sparse Retrieval: BM25 and TF-IDF</h2>
<h3>TF-IDF</h3>
<p>A word is important in a document if it appears often in that document (TF) but rarely across all documents (IDF). "the" appears everywhere = low IDF. "rajesh" appears in 3 of 10,000 docs = high IDF.</p>
<h3>BM25</h3>
<p>Improved TF-IDF. Current standard for keyword search. Adds diminishing returns for term frequency and document length normalization.</p>
<pre><code>from rank_bm25 import BM25Okapi

corpus = [
    "suspect transferred money via UPI",
    "victim reported abuse on social media",
    "bank records show transaction to rajesh.m@ybl",
]
tokenized_corpus = [doc.lower().split() for doc in corpus]
bm25 = BM25Okapi(tokenized_corpus)

query = "rajesh.m@ybl UPI transfer"
scores = bm25.get_scores(query.lower().split())</code></pre>
<p><strong>Sparse beats dense:</strong> exact terms, short keyword queries, out-of-vocabulary terms.</p>
<p><strong>Dense beats sparse:</strong> conceptual queries, paraphrased content, multilingual search.</p>
<hr>
<h2>Hybrid Search: Combining Sparse + Dense</h2>
<p>Run both keyword search and vector search, then merge results.</p>
<h3>Reciprocal Rank Fusion (RRF)</h3>
<p>The most common merging strategy:</p>
<pre><code>RRF_score = sum(1 / (k + rank_i)) for each result list</code></pre>
<p>Where k is a constant (usually 60). Documents appearing in both lists get boosted.</p>
<h3>Weighted Scoring</h3>
<pre><code>final_score = alpha * vector_score + (1-alpha) * bm25_score</code></pre>
<p>Alpha = 0.5-0.7 (slightly favoring dense) works well as a starting point.</p>
<h3>Built-in Hybrid Search</h3>
<p>Weaviate and Qdrant have hybrid search built in, so you don't need to implement fusion yourself.</p>
<hr>
<h2>Why Retrieval Alone Isn't Enough: Reranking</h2>
<p>Retrieval is a fast, rough filter. It narrows millions of chunks to 20-100 candidates. But this shortlist still has noise.</p>
<h3>Bi-Encoder (Retrieval)</h3>
<p>Encodes query and document separately. Compares their vectors. Fast because you pre-compute document vectors. But never sees query + document together.</p>
<h3>Cross-Encoder (Reranking)</h3>
<p>Processes query and document together as a single input. Much more accurate because it can compare specific parts. But can't pre-compute -- must run for every (query, document) pair.</p>
<p>That's why you use a bi-encoder first (fast, handles millions) and a cross-encoder second (slow, handles tens).</p>
<hr>
<h2>Practical Reranking Options</h2>
<table>
<tr><th>Reranker</th><th>Type</th><th>Notes</th></tr>
<tr><td><strong>Cohere Rerank</strong></td><td>API-based</td><td>Simple, good quality</td></tr>
<tr><td><strong>BGE Reranker</strong></td><td>Open source</td><td>Run locally, no API needed</td></tr>
<tr><td><strong>ColBERT</strong></td><td>Late interaction</td><td>Middle ground: token-level matching, faster than cross-encoder</td></tr>
<tr><td><strong>FlashRank</strong></td><td>Lightweight</td><td>Runs on CPU, good for prototyping</td></tr>
</table>
<hr>
<h2>The Full Retrieval Pipeline</h2>
<pre><code>User Query
    |
[Query Processing] -- rewrite, expand, decompose
    |
[Hybrid Retrieval] -- BM25 (top 50) + Vector Search (top 50)
    |
[Fusion] -- RRF or weighted merge --> top 50 unique
    |
[Reranking] -- Cross-encoder scores each pair --> top 10
    |
[LLM Generation] -- top 5-10 chunks in prompt
    |
Final Answer</code></pre>
<p>Each stage is a funnel. Wide net at top, narrow down aggressively.</p>
<hr>
<h2>ACPIA Connection</h2>
<p>An investigator searches: "bank transfer to rajesh.m@ybl in March."</p>
<ul>
<li><strong>Pure vector</strong> finds chunks about bank transfers in general but misses the specific UPI ID.</li>
<li><strong>Pure keyword</strong> finds "rajesh.m@ybl" exactly but misses "payment sent to Rajesh's account."</li>
<li><strong>Hybrid</strong> catches both. <strong>Reranking</strong> puts the most relevant chunks at the top.</li>
</ul>
<p>For evidence retrieval, missing a relevant document can mean missing critical evidence. Hybrid search with reranking is a core requirement.</p>`,

"3-5": `<h1>Embedding Ambiguity and Limitations</h1>
<h2>What Embeddings Actually Capture</h2>
<p>An embedding is a list of floating-point numbers (a vector) that represents text in high-dimensional space. Similar meanings end up near each other; unrelated texts end up far apart.</p>
<p>What embeddings capture well: topic similarity, semantic relatedness, paraphrase detection.</p>
<p>But embeddings have real blind spots that you must understand.</p>
<hr>
<h2>What Embeddings Miss</h2>
<h3>Negation</h3>
<p>"The suspect IS guilty" and "The suspect is NOT guilty" are very similar in embedding space. They share almost all the same words. The model often doesn't weight "not" heavily enough.</p>
<h3>Exact Numbers</h3>
<p>"The transaction was $5,000" and "The transaction was $50,000" will have very similar embeddings. The model understands "transaction" and "dollar amount" but doesn't reliably distinguish actual numbers.</p>
<h3>Temporal Information</h3>
<p>"The event happened in January" and "The event happened in December" -- similar embeddings. Time is poorly represented.</p>
<h3>Logical Relationships</h3>
<p>"A caused B" vs "B caused A" -- similar embeddings, opposite meanings.</p>
<h3>Entity-Specific Facts</h3>
<p>"Rajesh lives in Kochi" and "Suresh lives in Kochi" -- very similar. The model sees "person lives in Kochi" and doesn't strongly differentiate which person.</p>
<hr>
<h2>The "Bank" Problem</h2>
<p>Classic semantic ambiguity: "bank to deposit money" (financial) vs "river bank" (geography) vs "plane banked left" (aviation).</p>
<p>Modern models use contextual embeddings (whole sentence determines the vector), but still struggle with less common meanings and short texts without enough context.</p>
<p>In ACPIA, "abuse" could mean child abuse, substance abuse, or verbal abuse. The embedding model needs enough surrounding context to place the vector correctly.</p>
<hr>
<h2>Query-Document Mismatch</h2>
<p>A user asks: <strong>"What is the suspect's phone number?"</strong></p>
<p>The document says: <strong>"Contact: +91 94956 73201 (Rajesh Menon)"</strong></p>
<p>These are semantically related but structurally different. Questions and answers occupy different regions in embedding space. This is why naive RAG often fails on factual lookup queries.</p>
<hr>
<h2>Embedding Model Comparison</h2>
<table>
<tr><th>Model</th><th>Dims</th><th>Type</th><th>Best For</th></tr>
<tr><td>OpenAI text-embedding-3</td><td>1536/3072</td><td>API</td><td>General purpose, easy to use</td></tr>
<tr><td>BGE (bge-m3)</td><td>384-1024</td><td>Open source</td><td>Multilingual, self-hosted</td></tr>
<tr><td>E5</td><td>384-4096</td><td>Open source</td><td>Instruction-tuned, query-document handling</td></tr>
<tr><td>Cohere embed-v3</td><td>1024</td><td>API</td><td>Search optimization, compression</td></tr>
<tr><td>GTE-Qwen2</td><td>varies</td><td>Open source</td><td>Good quality/size balance</td></tr>
</table>
<p><strong>Critical rule:</strong> Never mix embedding models. Same model for indexing and querying.</p>
<p>For prototyping: OpenAI. For production with data sensitivity: bge-m3 or GTE (self-hosted). Check MTEB leaderboard for benchmarks.</p>
<hr>
<h2>Dimensionality Trade-offs</h2>
<table>
<tr><th>Dimensions</th><th>Storage/vector</th><th>Use</th></tr>
<tr><td>384</td><td>1.5 KB</td><td>Small/fast models</td></tr>
<tr><td>768</td><td>3 KB</td><td>Good balance</td></tr>
<tr><td>1024</td><td>4 KB</td><td>High-quality general purpose</td></tr>
<tr><td>1536</td><td>6 KB</td><td>OpenAI's standard</td></tr>
<tr><td>3072+</td><td>12+ KB</td><td>Maximum quality, high cost</td></tr>
</table>
<p>For 1M vectors at 1536 dims: ~6 GB just for vectors. Diminishing returns above 1024 dims for most use cases.</p>
<hr>
<h2>Multilingual Embeddings</h2>
<p>Models like bge-m3 support multiple languages. English query can match Hindi document. But quality varies by language. Low-resource languages (Malayalam) perform worse. Code-switching and transliteration are poorly handled.</p>
<p>For ACPIA: chat logs may mix English, Hindi, and Malayalam. Use a multilingual model and consider translating before embedding.</p>
<hr>
<h2>When Embeddings Fail Silently</h2>
<p>The dangerous case: high cosine similarity score, but wrong retrieval. The system looks confident. The investigator trusts it. The answer is wrong.</p>
<p>A score of 0.85 doesn't mean "85% correct." It means vectors point in roughly the same direction -- similar topic, not necessarily correct answer.</p>
<hr>
<h2>Strategies to Handle Ambiguity</h2>
<ul>
<li><strong>Query Expansion</strong>: Generate multiple phrasings, search with all, merge results.</li>
<li><strong>HyDE</strong>: Ask LLM to generate a hypothetical answer, embed that instead of the query. Matches document-to-document.</li>
<li><strong>Multi-Vector Retrieval</strong>: Multiple embeddings per chunk (raw text + summary + generated questions).</li>
<li><strong>Metadata Filtering</strong>: Use exact metadata (dates, names, types) for what embeddings can't handle.</li>
<li><strong>Domain-Specific Fine-Tuning</strong>: Fine-tune the embedding model on your data. Last resort -- fix chunking, add hybrid search, and try reranking first.</li>
</ul>`,

"3-6": `<h1>RAG Evaluation Tooling and Metrics</h1>
<h2>Why RAG Evaluation Is Hard</h2>
<p>With traditional software, testing is binary: right or wrong. With RAG, a response can be correct but incomplete, complete but poorly worded, factually accurate but not answering the question, or based on the right source but drawing wrong conclusions.</p>
<p>You're evaluating two separate systems (retriever and generator) that interact in complex ways. You need to evaluate both independently AND the system as a whole.</p>
<hr>
<h2>Retrieval Quality Metrics</h2>
<h3>Precision@k</h3>
<p>Of the top-k retrieved chunks, what fraction is actually relevant?</p>
<pre><code>Precision@5 = (relevant chunks in top 5) / 5</code></pre>
<p>High precision = not wasting context window on irrelevant chunks.</p>
<h3>Recall@k</h3>
<p>Of all relevant chunks in the database, what fraction did you retrieve?</p>
<pre><code>Recall@10 = (relevant chunks in top 10) / (total relevant in DB)</code></pre>
<p>In ACPIA, missing a relevant chunk could mean missing critical evidence.</p>
<h3>MRR (Mean Reciprocal Rank)</h3>
<p>At what position does the first relevant result appear? <code>RR = 1 / rank</code>. Average across queries.</p>
<h3>NDCG</h3>
<p>Like precision, but position-aware. Relevant results at top are worth more than at bottom. Matters because of the "lost in the middle" effect.</p>
<hr>
<h2>Generation Quality Metrics</h2>
<h3>Faithfulness</h3>
<p>Does the answer only contain information from the retrieved context?</p>
<pre><code>Faithfulness = (claims supported by context) / (total claims)</code></pre>
<p>For ACPIA, faithfulness must be near 1.0. Hallucinated evidence in an investigation report is dangerous.</p>
<h3>Answer Relevancy</h3>
<p>Does the answer actually address the question? An answer can be factually correct and grounded but still not answer what was asked.</p>
<h3>Completeness</h3>
<p>Does the answer cover all important information from the context?</p>
<hr>
<h2>RAGAS Framework</h2>
<p>The most widely used RAG evaluation framework. Four core metrics:</p>
<ul>
<li><strong>Faithfulness</strong>: Breaks answer into claims, checks each against context.</li>
<li><strong>Answer Relevancy</strong>: Generates hypothetical questions from answer, compares to original question.</li>
<li><strong>Context Precision</strong>: Are relevant chunks ranked higher than irrelevant ones?</li>
<li><strong>Context Recall</strong>: Does context contain all information needed to answer?</li>
</ul>
<pre><code>from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevancy, context_precision, context_recall
from datasets import Dataset

eval_data = {
    "question": ["What phone number is associated with the suspect?"],
    "answer": ["The suspect's phone number is +91 94956 73201."],
    "contexts": [["Contact: Rajesh Menon, +91 94956 73201, registered under BSNL Kerala"]],
    "ground_truth": ["+91 94956 73201"],
}
dataset = Dataset.from_dict(eval_data)
results = evaluate(dataset, metrics=[faithfulness, answer_relevancy, context_precision, context_recall])</code></pre>
<hr>
<h2>Other Evaluation Tools</h2>
<table>
<tr><th>Tool</th><th>Strength</th><th>Use For</th></tr>
<tr><td><strong>DeepEval</strong></td><td>More metrics, G-Eval, toxicity, bias</td><td>Granular evaluation</td></tr>
<tr><td><strong>TruLens</strong></td><td>Step-by-step tracing, groundedness</td><td>Debugging which step failed</td></tr>
<tr><td><strong>Phoenix (Arize)</strong></td><td>Traces, embedding drift, A/B testing</td><td>Production monitoring</td></tr>
</table>
<hr>
<h2>LLM-as-Judge</h2>
<p>Use a strong LLM to evaluate another LLM's output. Sounds circular, but works well in practice.</p>
<p><strong>Why it works:</strong> LLMs are good at comparing texts and spotting inconsistencies. Much cheaper than human evaluation. Correlates ~80-90% with human judgment.</p>
<p><strong>Limitations:</strong> Self-preference bias, position bias, verbosity bias, can't verify facts the judge doesn't know.</p>
<p><strong>Best practice:</strong> Validate your LLM judge against human annotations on a small set first.</p>
<hr>
<h2>Building Golden Evaluation Datasets</h2>
<p>You need (question, ground_truth, relevant_chunks) tuples.</p>
<p><strong>Hybrid approach (recommended):</strong></p>
<ol>
<li>Generate synthetic QA pairs from your documents using an LLM</li>
<li>Have domain experts review, edit, and filter them</li>
<li>Experts add 20-30 real-world questions the LLM missed</li>
<li>Result: 100-200 high-quality evaluation pairs</li>
</ol>
<hr>
<h2>Continuous Production Monitoring</h2>
<p>What to track:</p>
<ul>
<li><strong>Retrieval latency</strong> -- is search getting slower?</li>
<li><strong>Retrieval scores</strong> -- are similarity scores dropping?</li>
<li><strong>Faithfulness over time</strong> -- weekly average. A drop means more hallucination.</li>
<li><strong>User feedback</strong> -- thumbs up/down. Most direct signal.</li>
<li><strong>No-result queries</strong> -- reveal gaps in your knowledge base.</li>
<li><strong>Embedding drift</strong> -- query distribution shifts as users ask new types of questions.</li>
</ul>
<h3>Alerting Thresholds</h3>
<ul>
<li>Average faithfulness drops below 0.85: investigate retrieval quality</li>
<li>&gt;10% of queries with similarity &lt;0.7: check embedding model or missing docs</li>
<li>Retrieval latency exceeds 500ms p95: index needs optimization</li>
</ul>
<hr>
<h2>ACPIA-Specific Evaluation</h2>
<ul>
<li><strong>Entity extraction accuracy:</strong> Precision/recall of extracted phone numbers, UPI IDs, names, handles</li>
<li><strong>Timeline correctness:</strong> Events in right order? Dates accurate? Any hallucinated events?</li>
<li><strong>Cross-reference accuracy:</strong> When linking a phone number to a UPI ID to a name, is the linkage correct?</li>
</ul>
<p>A wrong cross-reference in an investigation is worse than no cross-reference at all.</p>
<h3>Evaluation Cheat Sheet</h3>
<table>
<tr><th>What</th><th>Metric</th><th>Tool</th></tr>
<tr><td>Right chunks retrieved?</td><td>Precision@k, Recall@k, MRR</td><td>RAGAS, custom</td></tr>
<tr><td>Relevant chunks ranked high?</td><td>NDCG, Context Precision</td><td>RAGAS</td></tr>
<tr><td>Answer grounded in context?</td><td>Faithfulness</td><td>RAGAS, DeepEval</td></tr>
<tr><td>Answer addresses question?</td><td>Answer Relevancy</td><td>RAGAS, DeepEval</td></tr>
<tr><td>Answer factually correct?</td><td>Answer Correctness</td><td>LLM-as-judge, human</td></tr>
<tr><td>System degrading over time?</td><td>Metric trends</td><td>Phoenix, custom</td></tr>
</table>`,
};
