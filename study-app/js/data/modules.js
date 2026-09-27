// ======================================
// MODULES DATA — All modules, topics, and flashcards
// Updated to 14 modules across 5 learning phases
// ======================================

const MODULES = [
  // ── PHASE 1: FOUNDATIONS ──────────────────────────
  {
    id: 1,
    title: "Prompt Engineering",
    phase: 1,
    topics: [
      { id: "1-1", title: "Fundamentals & Patterns", cards: [
        {
          q: "What is prompt engineering and why does it matter?",
          a: "<p><strong>Prompt engineering</strong> is the practice of designing and refining inputs to LLMs to get desired outputs. It matters because the same model can give dramatically different quality answers depending on how you ask.</p><p><strong>Key elements of a good prompt:</strong></p><ul><li><strong>Role</strong> — who the model should act as</li><li><strong>Context</strong> — background information</li><li><strong>Task</strong> — what you want done</li><li><strong>Format</strong> — how the output should be structured</li><li><strong>Constraints</strong> — what to avoid or limits to follow</li></ul><p>Prompt engineering is the first lever to pull before RAG, fine-tuning, or any other technique.</p>"
        },
        {
          q: "What are the main prompt patterns?",
          a: "<p><strong>Core patterns:</strong></p><ul><li><strong>Instruction</strong> — direct command: \"Summarize this in 3 bullet points\"</li><li><strong>Role-play</strong> — \"You are a senior backend engineer reviewing this code\"</li><li><strong>Step-by-step</strong> — \"Think through this step by step before answering\"</li><li><strong>Few-shot</strong> — provide examples of input/output pairs before the actual task</li><li><strong>Structured output</strong> — \"Respond in JSON with keys: summary, confidence, sources\"</li></ul><p><strong>Advanced patterns:</strong></p><ul><li><strong>Chain-of-thought</strong> — force reasoning before conclusion</li><li><strong>Self-consistency</strong> — generate multiple answers and pick the most common</li><li><strong>Tree-of-thought</strong> — explore multiple reasoning paths</li><li><strong>ReAct</strong> — interleave reasoning and action steps</li></ul>"
        },
        {
          q: "How do temperature and sampling parameters affect output?",
          a: "<p><strong>Temperature (0.0-2.0):</strong></p><ul><li><strong>0.0</strong> — deterministic, always picks most likely token. Best for factual tasks, code generation, structured output.</li><li><strong>0.3-0.7</strong> — balanced. Good default for most tasks.</li><li><strong>0.8-1.5</strong> — more creative/varied. Good for brainstorming, creative writing.</li></ul><p><strong>Top-p (nucleus sampling):</strong> Only consider tokens whose cumulative probability reaches p. Top-p=0.9 means consider tokens until you cover 90% probability mass. Lower = more focused.</p><p><strong>Top-k:</strong> Only consider the k most likely tokens. Simpler than top-p.</p><p><strong>Rule:</strong> Use temperature OR top-p, not both aggressively. For production, temperature 0-0.3 with structured outputs is the safe default.</p>"
        }
      ]},
      { id: "1-2", title: "Chain-of-Thought & Reasoning", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p><p>This topic will cover chain-of-thought prompting, reasoning strategies, and when to use them.</p>" }] },
      { id: "1-3", title: "System Prompts & Persona Design", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "1-4", title: "Prompt Testing & Versioning", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "1-5", title: "Few-Shot / Zero-Shot / ICL", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] }
    ]
  },
  {
    id: 2,
    title: "Backend Fundamentals",
    phase: 1,
    topics: [
      { id: "2-1", title: "Async Patterns and Concurrency", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "2-2", title: "Message Queues & Event-Driven", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "2-3", title: "N+1 Query Problem", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "2-4", title: "Sharding and Pagination", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] }
    ]
  },

  // ── PHASE 2: CORE AI ENGINEERING ─────────────────
  {
    id: 3,
    title: "Retrieval-Augmented Generation (RAG)",
    phase: 2,
    topics: [
      {
        id: "3-1",
        title: "RAG and Retrieval Fundamentals",
        cards: [
          {
            q: "What is RAG and why does it exist?",
            a: "<p><strong>RAG (Retrieval-Augmented Generation)</strong> is a pattern where you give an LLM relevant information retrieved from external sources before it generates an answer.</p><p>It exists because LLMs have three fundamental problems:</p><ul><li><strong>Knowledge cutoff</strong> — they only know what was in their training data</li><li><strong>No private data</strong> — they can't access your documents, databases, or internal systems</li><li><strong>Hallucination</strong> — they confidently generate plausible but wrong answers</li></ul><p>RAG solves all three by fetching real, relevant data and putting it in the prompt context.</p>"
          },
          {
            q: "Walk through the RAG pipeline step by step.",
            a: "<p>The RAG pipeline has two phases:</p><p><strong>Indexing phase (done once):</strong></p><ul><li><strong>Load</strong> — read documents (PDFs, chat logs, databases)</li><li><strong>Chunk</strong> — split documents into smaller pieces</li><li><strong>Embed</strong> — convert each chunk into a vector (array of numbers) using an embedding model</li><li><strong>Store</strong> — save vectors in a vector database with metadata</li></ul><p><strong>Query phase (every user query):</strong></p><ul><li><strong>Embed the query</strong> — same embedding model converts the question to a vector</li><li><strong>Retrieve</strong> — find the most similar chunks from the vector DB</li><li><strong>Augment</strong> — inject retrieved chunks into the LLM prompt as context</li><li><strong>Generate</strong> — LLM produces an answer grounded in the retrieved context</li></ul>"
          },
          {
            q: "What are the key components of a RAG system?",
            a: "<p>Four core components:</p><ul><li><strong>Embedding model</strong> — converts text to vectors (e.g., OpenAI text-embedding-3-small, BGE, E5). Must use the same model for indexing and querying.</li><li><strong>Vector store</strong> — stores and searches embeddings (Pinecone, Qdrant, Chroma, pgvector, FAISS)</li><li><strong>Retriever</strong> — the logic that decides what to fetch and how many results (top-k, filtering, hybrid search)</li><li><strong>Generator</strong> — the LLM that produces the final answer using retrieved context (GPT-4, Claude, Gemini, Llama)</li></ul><p>Supporting pieces: document loaders, text splitters, prompt templates, and optionally a reranker.</p>"
          },
          {
            q: "What's the difference between Naive RAG, Advanced RAG, and Modular RAG?",
            a: "<p><strong>Naive RAG:</strong> The basic pipeline — embed, retrieve top-k, stuff into prompt, generate. Simple but has problems: retrieves irrelevant chunks, no quality control, context window waste.</p><p><strong>Advanced RAG:</strong> Adds optimizations at each stage:</p><ul><li><strong>Pre-retrieval</strong> — query rewriting, expansion, HyDE</li><li><strong>Retrieval</strong> — hybrid search, reranking, metadata filtering</li><li><strong>Post-retrieval</strong> — chunk compression, deduplication, relevance scoring</li></ul><p><strong>Modular RAG:</strong> Treats each component as a swappable module. You can add routing (decide if retrieval is even needed), iterative retrieval (multiple rounds), or agent-controlled retrieval (LLM decides when/what to retrieve).</p><p>Most production systems are Advanced RAG. Modular RAG is what agentic systems use.</p>"
          },
          {
            q: "When should you use RAG vs fine-tuning vs prompt engineering?",
            a: "<p><strong>Prompt engineering:</strong> When the task can be solved by better instructions alone. No external data needed. Example: formatting output, changing tone.</p><p><strong>RAG:</strong> When the model needs access to external, changing, or private data. Example: answering questions about your company docs, case files, or recent events. Data can be updated without retraining.</p><p><strong>Fine-tuning:</strong> When you need to change the model's behavior, style, or teach it domain-specific patterns. Example: making it write in legal language, or follow a specific output format consistently.</p><p><strong>Often combined:</strong> Fine-tune for behavior + RAG for knowledge. Don't fine-tune just to inject knowledge — it's expensive, hard to update, and RAG does it better.</p>"
          },
          {
            q: "What are the common failure modes in RAG?",
            a: "<p><strong>Retrieval failures:</strong></p><ul><li><strong>Wrong chunks retrieved</strong> — embedding doesn't capture the right meaning</li><li><strong>Relevant info not chunked properly</strong> — answer spans two chunks, neither is complete</li><li><strong>Missing metadata filtering</strong> — retrieves from wrong document or time period</li></ul><p><strong>Generation failures:</strong></p><ul><li><strong>Ignoring context</strong> — LLM relies on its own knowledge instead of retrieved chunks</li><li><strong>Lost in the middle</strong> — LLM pays more attention to chunks at start/end, misses middle ones</li><li><strong>Hallucinating beyond context</strong> — makes up details not in the retrieved text</li></ul><p><strong>System failures:</strong></p><ul><li><strong>Stale index</strong> — documents updated but embeddings not re-indexed</li><li><strong>Latency</strong> — retrieval + generation adds up, especially with reranking</li><li><strong>Cost</strong> — large context windows are expensive per query</li></ul>"
          }
        ]
      },
      {
        id: "3-2",
        title: "Chunking Strategies",
        cards: [
          {
            q: "Why does chunking matter in RAG?",
            a: "<p>Chunking is how you split documents into smaller pieces before embedding them. It matters because:</p><ul><li><strong>Retrieval precision</strong> — smaller, focused chunks mean you retrieve exactly what's relevant, not a whole page with one useful sentence</li><li><strong>Embedding quality</strong> — embedding models work best on coherent, focused text. A chunk mixing two topics creates a confused vector.</li><li><strong>Context window limits</strong> — you can only fit so many tokens in the LLM prompt. Precise chunks = less waste.</li></ul><p>Bad chunking is the #1 silent killer of RAG quality. You can have the best embedding model and LLM, but if your chunks are wrong, retrieval fails.</p>"
          },
          {
            q: "Explain the main chunking strategies and when to use each.",
            a: "<p><strong>Fixed-size chunking:</strong> Split every N characters/tokens with overlap. Simple, fast, content-agnostic. Use for: uniform text, quick prototypes. Problem: cuts mid-sentence.</p><p><strong>Recursive character splitting:</strong> Tries to split on paragraphs first, then sentences, then words. LangChain's default. Use for: general-purpose text. Good balance of speed and quality.</p><p><strong>Semantic chunking:</strong> Uses embeddings to detect topic shifts. Groups sentences with similar meaning. Use for: documents with mixed topics. Slower but more accurate boundaries.</p><p><strong>Document-aware chunking:</strong> Respects document structure — splits on markdown headers, HTML tags, code blocks. Use for: structured documents, technical docs.</p><p><strong>Parent-child chunking:</strong> Small chunks for retrieval (precise matching), but returns the larger parent chunk for context. Best of both worlds. Use for: production systems needing both precision and context.</p>"
          },
          {
            q: "What happens when chunks are too small vs too large?",
            a: "<p><strong>Too small (e.g., single sentences):</strong></p><ul><li>Loses context — \"He transferred the money\" means nothing without knowing who \"he\" is</li><li>Retrieves many fragments, LLM struggles to synthesize</li><li>Higher storage and retrieval cost (more vectors)</li></ul><p><strong>Too large (e.g., full pages):</strong></p><ul><li>Diluted embeddings — vector represents an average of many topics</li><li>Retrieves irrelevant content alongside relevant content</li><li>Wastes context window tokens</li><li>\"Lost in the middle\" problem gets worse</li></ul><p><strong>Sweet spot:</strong> Typically 256-1024 tokens depending on content. Chat logs: smaller (128-256). Legal documents: larger (512-1024). Always test with your actual data.</p>"
          },
          {
            q: "What is chunk overlap and why is it used?",
            a: "<p><strong>Overlap</strong> means consecutive chunks share some text at their boundaries. Example: with 512-token chunks and 50-token overlap, the last 50 tokens of chunk 1 appear as the first 50 tokens of chunk 2.</p><p><strong>Why:</strong></p><ul><li>Prevents information loss at boundaries — if a key fact sits at a split point, overlap ensures it appears fully in at least one chunk</li><li>Maintains context continuity across chunks</li></ul><p><strong>Typical overlap:</strong> 10-20% of chunk size. So for 500-token chunks, use 50-100 token overlap.</p><p><strong>Trade-off:</strong> More overlap = more redundant storage and slightly more vectors to search. But usually worth it for better retrieval.</p>"
          }
        ]
      },
      {
        id: "3-3",
        title: "Vector Database Indexing",
        cards: [
          {
            q: "What does a vector database actually do?",
            a: "<p>A vector database stores high-dimensional vectors (embeddings) and lets you quickly find the most similar vectors to a query vector.</p><p><strong>Core operations:</strong></p><ul><li><strong>Insert</strong> — store a vector with metadata (source file, page number, timestamp)</li><li><strong>Search</strong> — given a query vector, find the top-k most similar stored vectors</li><li><strong>Filter</strong> — narrow search by metadata before or after similarity matching</li><li><strong>Delete/Update</strong> — manage the lifecycle of stored vectors</li></ul><p><strong>Similarity metrics:</strong></p><ul><li><strong>Cosine similarity</strong> — measures angle between vectors (most common, -1 to 1)</li><li><strong>Dot product</strong> — like cosine but considers magnitude</li><li><strong>Euclidean (L2)</strong> — straight-line distance in vector space</li></ul><p>For normalized embeddings, cosine and dot product give the same results.</p>"
          },
          {
            q: "Explain the main indexing algorithms: Flat, IVF, HNSW, PQ.",
            a: "<p><strong>Flat (brute-force):</strong> Compares query against every single vector. 100% accurate but O(n) — unusable at scale. Good for <50K vectors.</p><p><strong>IVF (Inverted File Index):</strong> Clusters vectors into groups using k-means. At query time, only searches the nearest clusters. Fast but you might miss results in neighboring clusters. Tune <code>nprobe</code> (how many clusters to check).</p><p><strong>HNSW (Hierarchical Navigable Small World):</strong> Builds a multi-layer graph. Top layers are sparse (for fast navigation), bottom layers are dense (for accuracy). Like an express train → local train system. Most popular for production — great recall with fast speed.</p><p><strong>PQ (Product Quantization):</strong> Compresses vectors by splitting them into sub-vectors and quantizing each. Dramatically reduces memory (8-32x) at the cost of some accuracy. Often combined with IVF (IVF-PQ) for large-scale systems.</p><p>HNSW is the default choice for most production RAG systems.</p>"
          },
          {
            q: "Compare the main vector databases. When would you use each?",
            a: "<p><strong>Chroma:</strong> Lightweight, in-process, Python-native. Great for prototypes and small projects. No infrastructure needed. Limits: not built for scale.</p><p><strong>FAISS (Facebook):</strong> Library, not a database. Extremely fast, runs in-memory. No built-in persistence or metadata filtering. Use for: research, benchmarks, or when you manage your own storage.</p><p><strong>Pinecone:</strong> Fully managed cloud service. Zero ops, just API calls. Use for: teams that don't want to manage infrastructure. Downside: vendor lock-in, cost at scale.</p><p><strong>Qdrant:</strong> Open-source, Rust-based. Fast, rich filtering, good API. Can self-host or use cloud. Strong choice for production self-hosted setups.</p><p><strong>Weaviate:</strong> Open-source, supports hybrid search natively. Has built-in vectorization modules. Good for: teams wanting an all-in-one solution.</p><p><strong>pgvector:</strong> PostgreSQL extension. Use your existing Postgres. Good for: teams already on Postgres who don't want another database. Limited indexing options compared to dedicated vector DBs.</p>"
          },
          {
            q: "What is metadata filtering and why is it critical?",
            a: "<p>Metadata filtering lets you narrow vector search results by structured attributes <strong>before</strong> or <strong>after</strong> similarity matching.</p><p><strong>Example metadata:</strong> source file, date, case ID, document type, author, confidentiality level.</p><p><strong>Why critical:</strong></p><ul><li>Without it, a query about \"Case #2024-456\" might return similar text from a completely different case</li><li>It enforces data boundaries — only search within documents the user has access to (RBAC)</li><li>It reduces search space, improving both speed and relevance</li></ul><p><strong>Pre-filter vs post-filter:</strong></p><ul><li><strong>Pre-filter:</strong> Apply metadata filter first, then vector search within filtered set. More efficient, but might have fewer vectors to search.</li><li><strong>Post-filter:</strong> Do vector search first, then filter results. Might discard good matches, leaving fewer results than requested.</li></ul><p>Most production systems use pre-filtering for correctness.</p>"
          }
        ]
      },
      {
        id: "3-4",
        title: "Hybrid Search and Reranking",
        cards: [
          {
            q: "Why is pure vector search not enough?",
            a: "<p>Vector (dense) search finds <strong>semantically similar</strong> content, but has blind spots:</p><ul><li><strong>Keyword misses</strong> — searching for a specific code or ID might not match even if the chunk contains that exact phrase</li><li><strong>Rare terms</strong> — domain-specific jargon, names, case numbers get lost in semantic space</li><li><strong>Exact match needs</strong> — when the user types an exact error message, ID, or name, they need exact matching, not \"similar meaning\"</li></ul><p>Conversely, keyword search (BM25) finds exact terms but misses synonyms and paraphrases. \"Financial fraud\" wouldn't match \"money laundering\" with keyword search.</p><p>That's why production systems combine both.</p>"
          },
          {
            q: "How does hybrid search work?",
            a: "<p>Hybrid search runs <strong>two retrievals in parallel</strong> and merges the results:</p><p><strong>1. Sparse retrieval (BM25/TF-IDF):</strong> Traditional keyword matching. Scores documents by term frequency and rarity. Great for exact matches and rare terms.</p><p><strong>2. Dense retrieval (embeddings):</strong> Semantic similarity via vector search. Great for meaning, synonyms, and paraphrases.</p><p><strong>3. Fusion:</strong> Combine both result sets. Common methods:</p><ul><li><strong>Reciprocal Rank Fusion (RRF)</strong> — scores each result based on its rank in both lists: <code>score = 1/(k + rank)</code>. Simple and effective.</li><li><strong>Weighted scoring</strong> — <code>alpha * dense_score + (1-alpha) * sparse_score</code>. Lets you tune the balance.</li></ul><p>In practice, alpha=0.5 to 0.7 (slightly favoring dense) works well as a starting point.</p>"
          },
          {
            q: "What is reranking and how does it differ from retrieval?",
            a: "<p><strong>Retrieval</strong> is fast but rough — it casts a wide net to find candidates. <strong>Reranking</strong> is slow but precise — it carefully scores each candidate for true relevance.</p><p><strong>How rerankers work:</strong></p><ul><li>A <strong>bi-encoder</strong> (used in retrieval) embeds query and document separately, then compares. Fast but can't capture fine-grained interactions.</li><li>A <strong>cross-encoder</strong> (used in reranking) processes query AND document together through the same model. Sees word-level interactions. Much more accurate, but too slow to run on millions of documents.</li></ul><p><strong>The pipeline:</strong></p><ol><li>Retrieve top 50-100 candidates (fast, using hybrid search)</li><li>Rerank those candidates with a cross-encoder (slow, but only on 50-100 docs)</li><li>Take top 5-10 reranked results for the LLM</li></ol><p>Popular rerankers: Cohere Rerank, BGE-reranker, Jina Reranker, ColBERT.</p>"
          },
          {
            q: "When does hybrid search beat pure vector, and when doesn't it?",
            a: "<p><strong>Hybrid wins when:</strong></p><ul><li>Your data has lots of domain-specific terms, codes, names, or IDs</li><li>Users sometimes search by exact keywords, sometimes by natural language</li><li>You're in a domain like legal, medical, or law enforcement where specific terms carry weight</li></ul><p><strong>Pure vector may be enough when:</strong></p><ul><li>Content is homogeneous natural language (blog posts, articles)</li><li>Users always ask natural questions, never use specific codes or IDs</li><li>You're prototyping and want to keep things simple</li></ul><p><strong>Rule of thumb:</strong> Start with hybrid search in production. The overhead is minimal and the quality improvement is almost always worth it.</p>"
          }
        ]
      },
      {
        id: "3-5",
        title: "Embedding Ambiguity and Limitations",
        cards: [
          {
            q: "What do embeddings actually capture, and what do they miss?",
            a: "<p><strong>What they capture:</strong></p><ul><li>Semantic similarity — \"happy\" and \"joyful\" are close in embedding space</li><li>Topical relevance — text about cooking clusters together</li><li>Some relational patterns — \"king - man + woman = queen\" (the classic example)</li></ul><p><strong>What they miss:</strong></p><ul><li><strong>Negation</strong> — \"I love dogs\" and \"I don't love dogs\" often have very similar embeddings</li><li><strong>Exact numbers</strong> — \"transferred 5000 rupees\" vs \"transferred 50000 rupees\" may embed similarly</li><li><strong>Temporal info</strong> — \"before the incident\" vs \"after the incident\" may not be distinguishable</li><li><strong>Logical relationships</strong> — \"A causes B\" vs \"B causes A\" can embed the same way</li><li><strong>Order and sequence</strong> — embeddings are largely order-insensitive for short text</li></ul><p>This is why you can't rely on embeddings alone — you need hybrid search and metadata filtering to catch what embeddings miss.</p>"
          },
          {
            q: "What is the query-document mismatch problem?",
            a: "<p>When you embed a <strong>question</strong> and a <strong>statement</strong> using the same model, they may land in different regions of embedding space even though the statement is the perfect answer.</p><p><strong>Example:</strong></p><ul><li>Query: \"What is the punishment for Section 6?\"</li><li>Document: \"Section 6 prescribes imprisonment of not less than 20 years.\"</li></ul><p>The question and the answer are semantically related but structurally different. The embedding of a question doesn't always align with the embedding of its answer.</p><p><strong>Solutions:</strong></p><ul><li><strong>HyDE (Hypothetical Document Embedding)</strong> — ask the LLM to generate a hypothetical answer first, then embed that hypothetical answer for search. Since it's now statement-to-statement matching, retrieval improves.</li><li><strong>Query expansion</strong> — rewrite the query in multiple forms</li><li><strong>Instruction-tuned embedding models</strong> — models like E5 use prefixes like \"query:\" and \"passage:\" to handle this asymmetry</li></ul>"
          },
          {
            q: "How do you choose an embedding model?",
            a: "<p>Key factors:</p><ul><li><strong>Dimension size</strong> — 384, 768, 1024, 1536, 3072. Higher = more expressive but more storage and compute. 768-1024 is the sweet spot for most use cases.</li><li><strong>Max token length</strong> — how much text can you embed at once? Some models handle 512 tokens, others 8192. Must align with your chunk size.</li><li><strong>Multilingual support</strong> — if your data has multiple languages</li><li><strong>Benchmark performance</strong> — check MTEB leaderboard for retrieval-specific scores, not just overall</li></ul><p><strong>Popular options:</strong></p><ul><li><strong>OpenAI text-embedding-3-small/large</strong> — good default, hosted</li><li><strong>BGE / GTE</strong> — strong open-source options, can self-host</li><li><strong>E5</strong> — instruction-tuned, handles query-document asymmetry</li><li><strong>Cohere Embed v3</strong> — good multilingual, hosted</li></ul><p><strong>Critical rule:</strong> Never mix embedding models. The same model must be used for indexing and querying.</p>"
          },
          {
            q: "What strategies handle embedding ambiguity?",
            a: "<p><strong>Query expansion:</strong> Rewrite the user query into multiple variants. Search with all of them, merge results. Example: \"money transfer evidence\" also searches \"financial transaction records\", \"payment proof\", \"bank statement\".</p><p><strong>HyDE (Hypothetical Document Embedding):</strong> Ask the LLM to generate what the ideal answer document might look like, then embed that hypothetical document. Matches document-to-document instead of query-to-document.</p><p><strong>Multi-vector retrieval:</strong> Instead of one embedding per chunk, create multiple embeddings (e.g., one for the raw text, one for a summary, one for key entities). Search across all vectors.</p><p><strong>Metadata as backup:</strong> Tag chunks with explicit structured data (entities, dates, categories). When embedding fails, metadata filtering catches it.</p><p><strong>Domain-specific fine-tuning:</strong> Fine-tune the embedding model on your domain's data. Creates better vectors for your specific vocabulary and relationships. Use when general-purpose models consistently fail on your data.</p>"
          }
        ]
      },
      {
        id: "3-6",
        title: "RAG Evaluation Tooling",
        cards: [
          {
            q: "Why is evaluating RAG hard, and what do you need to measure?",
            a: "<p>RAG is hard to evaluate because there's <strong>no single right answer</strong>. The same question can have multiple valid answers with different wording. And you need to evaluate <strong>two things separately</strong>:</p><p><strong>Retrieval quality</strong> (did you find the right chunks?):</p><ul><li><strong>Context Precision</strong> — what fraction of retrieved chunks are actually relevant?</li><li><strong>Context Recall</strong> — did you retrieve all the chunks that contain the answer?</li><li><strong>MRR (Mean Reciprocal Rank)</strong> — how high does the first relevant result appear?</li><li><strong>NDCG</strong> — are relevant results ranked higher than irrelevant ones?</li></ul><p><strong>Generation quality</strong> (did the LLM answer correctly?):</p><ul><li><strong>Faithfulness</strong> — is the answer supported by the retrieved context? (no hallucination)</li><li><strong>Answer Relevancy</strong> — does the answer actually address the question?</li><li><strong>Completeness</strong> — does the answer cover all aspects of the question?</li></ul>"
          },
          {
            q: "How does the RAGAS framework work?",
            a: "<p><strong>RAGAS</strong> (Retrieval Augmented Generation Assessment) is the most popular RAG evaluation framework. It uses LLM-as-judge to score these metrics:</p><ul><li><strong>Faithfulness</strong> — extracts claims from the answer, checks if each claim is supported by the context. Score = supported claims / total claims.</li><li><strong>Answer Relevancy</strong> — generates hypothetical questions from the answer, measures how similar they are to the original question.</li><li><strong>Context Precision</strong> — checks if relevant chunks are ranked higher than irrelevant ones.</li><li><strong>Context Recall</strong> — compares retrieved context against a ground truth answer to check if all needed information was retrieved.</li></ul><p><strong>Usage:</strong></p><pre><code>from ragas import evaluate\nfrom ragas.metrics import faithfulness, answer_relevancy\n\nresult = evaluate(dataset, metrics=[faithfulness, answer_relevancy])</code></pre><p>You need: question, answer, contexts, and optionally ground_truth.</p>"
          },
          {
            q: "What is the LLM-as-judge approach and what are its pitfalls?",
            a: "<p><strong>LLM-as-judge</strong> means using a (usually stronger) LLM to evaluate the output of your RAG system. You prompt it with criteria and ask it to score or compare answers.</p><p><strong>Why it works:</strong></p><ul><li>Scales to thousands of evaluations without human reviewers</li><li>Can assess nuanced qualities like helpfulness, accuracy, tone</li><li>Much faster than human evaluation</li></ul><p><strong>Pitfalls:</strong></p><ul><li><strong>Self-preference bias</strong> — LLMs tend to rate their own outputs higher</li><li><strong>Position bias</strong> — in A/B comparisons, tends to prefer the first option</li><li><strong>Verbosity bias</strong> — longer answers get rated higher even if not better</li><li><strong>Can't verify facts</strong> — the judge LLM doesn't actually know if something is true</li></ul><p><strong>Best practice:</strong> Use LLM-as-judge for relative comparisons and trend detection, but validate with human evaluation on a sample. Never rely on it as the sole quality measure.</p>"
          },
          {
            q: "How do you build a golden evaluation dataset for RAG?",
            a: "<p>A <strong>golden dataset</strong> is a set of question-answer-context triples that you know are correct. It's your ground truth for measuring RAG quality.</p><p><strong>How to build one:</strong></p><ol><li><strong>Sample real queries</strong> — collect actual questions users would ask (or will ask)</li><li><strong>Find the correct chunks</strong> — manually identify which chunks in your index contain the answer</li><li><strong>Write reference answers</strong> — human-written correct answers for each question</li><li><strong>Include edge cases</strong> — questions where the answer spans multiple chunks, questions with no answer in the data, ambiguous questions</li></ol><p><strong>Size:</strong> Start with 50-100 high-quality examples. More is better but quality matters more than quantity.</p><p><strong>Maintenance:</strong> Update when your data changes. Stale golden datasets give misleading metrics.</p><p><strong>Shortcut:</strong> Use an LLM to generate initial QA pairs from your documents, then have humans review and correct them. Much faster than writing from scratch.</p>"
          }
        ]
      }
    ]
  },
  {
    id: 4,
    title: "Tool Use & MCP",
    phase: 2,
    topics: [
      { id: "4-1", title: "MCP vs API Trade-offs", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "4-2", title: "MCP Tool Selection & Architecture", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "4-3", title: "Function Calling & Structured Outputs", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "4-4", title: "A2A (Agent-to-Agent) Protocol", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] }
    ]
  },
  {
    id: 5,
    title: "Model Operations",
    phase: 2,
    topics: [
      { id: "5-1", title: "Context Window & Token Management", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "5-2", title: "Model Migration & Evaluation", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "5-3", title: "Fine-tuning (LoRA/QLoRA)", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "5-4", title: "Quantization (GPTQ/AWQ/GGUF)", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "5-5", title: "Model Serving & Inference", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] }
    ]
  },

  // ── PHASE 3: ADVANCED PATTERNS ───────────────────
  {
    id: 6,
    title: "Agentic Systems",
    phase: 3,
    topics: [
      { id: "6-1", title: "Agentic vs Workflow Distinction", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "6-2", title: "Guardrails & Threshold Enforcement", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "6-3", title: "Agent Loop Prevention", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "6-4", title: "Multi-Agent Coordination", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "6-5", title: "Agent Memory & State", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "6-6", title: "Human-in-the-Loop Patterns", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] }
    ]
  },
  {
    id: 7,
    title: "Agent Frameworks",
    phase: 3,
    topics: [
      { id: "7-1", title: "LangGraph", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "7-2", title: "CrewAI", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "7-3", title: "AutoGen / AG2", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "7-4", title: "LlamaIndex Agents", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "7-5", title: "Framework Comparison & Selection", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "7-6", title: "Building Custom Frameworks", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] }
    ]
  },
  {
    id: 8,
    title: "Security & Trust",
    phase: 3,
    topics: [
      { id: "8-1", title: "RBAC & Authorization", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "8-2", title: "Prompt Injection Mitigation", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "8-3", title: "Hallucination Detection", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "8-4", title: "PII Handling", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "8-5", title: "AI Safety Fundamentals", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] }
    ]
  },

  // ── PHASE 4: PRODUCTION & SCALE ──────────────────
  {
    id: 9,
    title: "LLMOps",
    phase: 4,
    topics: [
      { id: "9-1", title: "Deployment Pipelines", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "9-2", title: "Monitoring & Observability", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "9-3", title: "Cost Optimization & Token Economics", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "9-4", title: "A/B Testing for AI Features", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "9-5", title: "CI/CD for AI Apps", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "9-6", title: "Prompt Registries & Versioning", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] }
    ]
  },
  {
    id: 10,
    title: "Systems & Infrastructure",
    phase: 4,
    topics: [
      { id: "10-1", title: "Distributed Systems Fundamentals", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "10-2", title: "System Design Methodology", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "10-3", title: "Production Monitoring", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "10-4", title: "GPU Infra & Compute Management", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "10-5", title: "Edge Deployment", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] }
    ]
  },
  {
    id: 11,
    title: "Engineering Practice",
    phase: 4,
    topics: [
      { id: "11-1", title: "Architecture Ownership", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "11-2", title: "AI-Assisted Dev Discipline", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "11-3", title: "Code Review for AI-Generated Code", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "11-4", title: "Leadership & Mentoring", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] }
    ]
  },

  // ── PHASE 5: SPECIALIZATIONS ─────────────────────
  {
    id: 12,
    title: "Multi-Modal AI",
    phase: 5,
    topics: [
      { id: "12-1", title: "Vision-Language Models", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "12-2", title: "Audio & Speech (Whisper/TTS)", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "12-3", title: "Image Generation & Diffusion", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "12-4", title: "Multi-Modal RAG", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "12-5", title: "Video Understanding", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] }
    ]
  },
  {
    id: 13,
    title: "Decision Models",
    phase: 5,
    topics: [
      { id: "13-1", title: "Laya (Open-Weight Decision Models)", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "13-2", title: "Jev (Hosted Decision API)", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "13-3", title: "System One/Two Thinking in AI", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "13-4", title: "Structured Reasoning in Agents", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "13-5", title: "Metacognition & Self-Evaluation", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] }
    ]
  },
  {
    id: 14,
    title: "Ethical AI",
    phase: 5,
    topics: [
      { id: "14-1", title: "Bias Detection & Mitigation", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "14-2", title: "Fairness Metrics", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "14-3", title: "Explainability (XAI)", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "14-4", title: "Regulations (EU AI Act, NIST)", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] },
      { id: "14-5", title: "AI Incident Response", cards: [{ q: "Placeholder", a: "<p><strong>Coming soon</strong></p>" }] }
    ]
  }
];

const PHASE_NAMES = {
  1: "Foundations",
  2: "Core AI Engineering",
  3: "Advanced Patterns",
  4: "Production & Scale",
  5: "Specializations"
};
