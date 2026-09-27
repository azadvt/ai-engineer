# Tools and Frameworks

A categorized reference of tools, frameworks, and platforms commonly used in AI engineering. Each table includes practical guidance on when to use each option.

---

## LLM Providers

| Name | Type | Best For | License / Pricing |
|------|------|----------|-------------------|
| OpenAI (GPT-4o, o3, o4-mini) | Proprietary API | General-purpose tasks, structured outputs, broad ecosystem support | Pay-per-token; tiered pricing by model |
| Anthropic (Claude Opus, Sonnet, Haiku) | Proprietary API | Long-context tasks, safety-sensitive applications, extended thinking/reasoning | Pay-per-token; tiered pricing by model |
| Google (Gemini 2.5 Pro, Flash) | Proprietary API | Multimodal tasks, Google ecosystem integration, cost-effective reasoning | Pay-per-token; free tier available |
| Meta (Llama 3, 3.1, 4) | Open weights | Self-hosting, fine-tuning, privacy-sensitive deployments, research | Free (open weights); compute costs for hosting |
| Mistral (Mistral Large, Small, Codestral) | Open weights + API | European deployment, multilingual tasks, code generation | Free (open weights) or pay-per-token (API) |
| DeepSeek (V3, R1) | Open weights + API | Budget-conscious deployments, reasoning (R1), research | Free (open weights) or pay-per-token (API) |
| Cohere (Command R+) | Proprietary API | Enterprise RAG, multilingual search, grounded generation | Pay-per-token; enterprise plans available |
| AWS Bedrock | Multi-provider gateway | Running multiple providers through a single AWS-integrated API | Pay-per-token; varies by model |
| Azure OpenAI Service | Managed OpenAI | Enterprise compliance, Azure ecosystem integration, regional deployment | Pay-per-token; enterprise agreements |

## Frameworks

| Name | Type | Best For | License / Pricing |
|------|------|----------|-------------------|
| LangChain | Orchestration framework | Rapid prototyping of chains, agents, and RAG pipelines; large ecosystem of integrations | MIT; free and open source |
| LangGraph | Agent framework | Building stateful, multi-step agents with explicit control flow graphs; complex agent architectures | MIT; free and open source |
| LlamaIndex | Data framework for LLMs | Data ingestion, indexing, and retrieval; structured data + LLM integration; production RAG | MIT; free and open source |
| Haystack | End-to-end NLP/LLM framework | Production NLP/LLM pipelines with a component-based architecture; enterprise search | Apache 2.0; free and open source |
| Semantic Kernel | SDK for AI integration | .NET and Java applications; enterprise Microsoft ecosystem integration | MIT; free and open source |
| CrewAI | Multi-agent framework | Orchestrating teams of specialized AI agents with role-based task delegation | MIT; free and open source |
| AutoGen | Multi-agent conversation | Multi-agent systems with human-in-the-loop; research and experimentation | MIT; free and open source |
| DSPy | Programmatic prompting | Optimizing LLM pipelines by compiling declarative programs into effective prompts | MIT; free and open source |
| Instructor | Structured output library | Extracting structured (Pydantic) outputs from any LLM provider with validation and retries | MIT; free and open source |
| Pydantic AI | Agent framework | Type-safe agent development with Pydantic integration; production agent systems | MIT; free and open source |

## Vector Databases

| Name | Type | Best For | License / Pricing |
|------|------|----------|-------------------|
| Pinecone | Managed cloud service | Fully managed vector search with zero ops overhead; production RAG at scale | Proprietary; free tier + pay-per-usage |
| Qdrant | Self-hosted or cloud | High-performance filtering with payload indexes; Rust-based efficiency; flexible deployment | Apache 2.0 (self-hosted); managed cloud available |
| Chroma | Embedded or client-server | Local development, prototyping, small-to-medium datasets; simple API | Apache 2.0; free and open source |
| Weaviate | Self-hosted or cloud | Multimodal search, GraphQL API, built-in vectorization modules | BSD-3; managed cloud available |
| Milvus | Self-hosted or cloud (Zilliz) | Large-scale production deployments, GPU-accelerated search, complex queries | Apache 2.0; Zilliz Cloud for managed |
| pgvector | PostgreSQL extension | Adding vector search to existing PostgreSQL databases without new infrastructure | PostgreSQL License; free and open source |
| FAISS | Library (not a database) | Research, offline similarity search, maximum performance on a single machine | MIT; free and open source |
| Elasticsearch (kNN) | Self-hosted or cloud | Hybrid keyword + vector search in an existing Elasticsearch deployment | SSPL / Elastic License; managed cloud available |

## Evaluation

| Name | Type | Best For | License / Pricing |
|------|------|----------|-------------------|
| RAGAS | RAG evaluation framework | Evaluating RAG pipelines across faithfulness, relevance, context precision/recall | Apache 2.0; free and open source |
| DeepEval | LLM evaluation framework | Comprehensive LLM output testing with 14+ metrics including hallucination and toxicity | Apache 2.0; free and open source |
| TruLens | Feedback-based evaluation | Tracking and evaluating LLM app quality over time with feedback functions | MIT; free and open source |
| LangSmith | Observability + evaluation | Tracing, debugging, and evaluating LangChain-based (and general LLM) applications | Proprietary; free tier + paid plans |
| Braintrust | Evaluation platform | Experiment tracking, scoring, and comparison for LLM outputs; CI/CD integration | Proprietary; free tier + paid plans |
| Promptfoo | Prompt testing CLI | Systematic prompt comparison and regression testing across models and prompts | MIT; free and open source |
| OpenAI Evals | Evaluation framework | Running standardized benchmarks and custom evaluations against OpenAI models | MIT; free and open source |
| Arize Phoenix | Observability | LLM trace visualization, evaluation, and debugging; production monitoring | Elastic License 2.0; free and open source |

## Deployment and Serving

| Name | Type | Best For | License / Pricing |
|------|------|----------|-------------------|
| vLLM | Inference engine | High-throughput production serving of open-weight models; PagedAttention for memory efficiency | Apache 2.0; free and open source |
| TGI (Text Generation Inference) | Inference server | Serving Hugging Face models with optimized inference; tensor parallelism | Apache 2.0 (HF); free and open source |
| Ollama | Local model runner | Running open-weight models locally for development, testing, and privacy | MIT; free and open source |
| LMStudio | Desktop model runner | User-friendly local model experimentation with a GUI; no coding required | Proprietary; free for personal use |
| NVIDIA Triton | Inference server | Multi-framework, multi-GPU model serving at enterprise scale; dynamic batching | BSD-3; free and open source |
| BentoML | Model serving framework | Packaging and deploying ML models as production-ready API services | Apache 2.0; free and open source; BentoCloud for managed |
| Ray Serve | Scalable serving | Distributed model serving with complex inference graphs; autoscaling | Apache 2.0; free and open source; Anyscale for managed |
| Modal | Serverless compute | Running GPU workloads without infrastructure management; burst compute for inference and fine-tuning | Proprietary; pay-per-second compute |

---

## Selection Guidance

**Starting a new project:** Begin with a managed LLM provider (OpenAI, Anthropic, or Google), Instructor or LangChain for orchestration, Chroma for vector storage, and RAGAS for evaluation. This stack minimizes infrastructure overhead and lets you focus on the application.

**Scaling to production:** Move to Pinecone or Qdrant for vector search, add LangSmith or Arize Phoenix for observability, and consider self-hosting open-weight models via vLLM if cost or privacy requires it.

**Multi-provider strategy:** Use Instructor or LiteLLM as an abstraction layer to maintain flexibility across LLM providers without rewriting application logic.
