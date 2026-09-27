# Key Research Papers

Essential papers for AI engineers, organized from foundational to recent. Each entry includes a brief summary and a link placeholder for easy access.

---

## Foundational Papers

These papers established the architectures and techniques that underpin modern AI engineering.

| Title | Authors | Year | Summary | Link |
|-------|---------|------|---------|------|
| Attention Is All You Need | Vaswani et al. | 2017 | Introduced the Transformer architecture, replacing recurrence with self-attention, enabling massive parallelization and becoming the foundation for all modern LLMs | [arXiv:1706.03762](https://arxiv.org/abs/1706.03762) |
| BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding | Devlin et al. | 2018 | Introduced bidirectional pretraining with masked language modeling and next sentence prediction, establishing the pretrain-then-finetune paradigm | [arXiv:1810.04805](https://arxiv.org/abs/1810.04805) |
| Improving Language Understanding by Generative Pre-Training (GPT) | Radford et al. | 2018 | Demonstrated that generative pretraining on unlabeled text followed by discriminative fine-tuning yields strong performance across NLP tasks | [OpenAI](https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf) |
| Language Models are Unsupervised Multitask Learners (GPT-2) | Radford et al. | 2019 | Showed that scaling up language models produces emergent zero-shot task performance without any task-specific training | [OpenAI](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf) |
| Language Models are Few-Shot Learners (GPT-3) | Brown et al. | 2020 | Demonstrated that very large language models can perform tasks via in-context learning with just a few examples, without gradient updates | [arXiv:2005.14165](https://arxiv.org/abs/2005.14165) |
| Training Language Models to Follow Instructions with Human Feedback (InstructGPT) | Ouyang et al. | 2022 | Introduced RLHF for aligning language models with human intent, making outputs more helpful, harmless, and honest | [arXiv:2203.02155](https://arxiv.org/abs/2203.02155) |
| Efficient Estimation of Word Representations in Vector Space (Word2Vec) | Mikolov et al. | 2013 | Introduced Word2Vec embeddings, establishing the concept of dense vector representations for words that capture semantic relationships | [arXiv:1301.3781](https://arxiv.org/abs/1301.3781) |
| Scaling Laws for Neural Language Models | Kaplan et al. | 2020 | Characterized power-law relationships between model performance and compute, dataset size, and parameter count | [arXiv:2001.08361](https://arxiv.org/abs/2001.08361) |

## RAG-Specific Papers

Papers focused on retrieval-augmented generation and related retrieval techniques.

| Title | Authors | Year | Summary | Link |
|-------|---------|------|---------|------|
| Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks | Lewis et al. | 2020 | The original RAG paper, combining a pretrained retriever (DPR) with a generator (BART) for knowledge-grounded generation | [arXiv:2005.11401](https://arxiv.org/abs/2005.11401) |
| Dense Passage Retrieval for Open-Domain Question Answering (DPR) | Karpukhin et al. | 2020 | Showed that dense embeddings trained with a simple dual-encoder architecture outperform sparse retrieval (BM25) for open-domain QA | [arXiv:2004.04906](https://arxiv.org/abs/2004.04906) |
| RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval | Sarthi et al. | 2024 | Proposes hierarchical summarization of documents into a tree structure for multi-level retrieval, improving performance on complex queries | [arXiv:2401.18059](https://arxiv.org/abs/2401.18059) |
| Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection | Asai et al. | 2023 | Trains a model to adaptively decide when to retrieve, evaluate retrieval quality, and critique its own generation | [arXiv:2310.11511](https://arxiv.org/abs/2310.11511) |
| Corrective Retrieval Augmented Generation (CRAG) | Yan et al. | 2024 | Introduces a corrective mechanism that evaluates retrieval quality and triggers web search as a fallback for low-confidence retrievals | [arXiv:2401.15884](https://arxiv.org/abs/2401.15884) |
| Lost in the Middle: How Language Models Use Long Contexts | Liu et al. | 2023 | Demonstrated that LLMs underperform when relevant information is buried in the middle of long contexts, with implications for RAG chunk ordering | [arXiv:2307.03172](https://arxiv.org/abs/2307.03172) |
| Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks | Reimers and Gurevych | 2019 | Adapted BERT for efficient sentence-level embeddings using siamese networks, enabling practical semantic search at scale | [arXiv:1908.10084](https://arxiv.org/abs/1908.10084) |
| ColBERT: Efficient and Effective Passage Search via Contextualized Late Interaction | Khattab and Zaharia | 2020 | Introduced late interaction for efficient yet accurate retrieval, bridging the gap between sparse and dense retrieval methods | [arXiv:2004.12832](https://arxiv.org/abs/2004.12832) |

## Recent and Notable Papers

Papers covering reasoning, agents, evaluation, and other emerging topics.

| Title | Authors | Year | Summary | Link |
|-------|---------|------|---------|------|
| Chain-of-Thought Prompting Elicits Reasoning in Large Language Models | Wei et al. | 2022 | Demonstrated that prompting models to show step-by-step reasoning dramatically improves performance on math, logic, and commonsense tasks | [arXiv:2201.11903](https://arxiv.org/abs/2201.11903) |
| Tree of Thoughts: Deliberate Problem Solving with Large Language Models | Yao et al. | 2023 | Generalized chain-of-thought to a tree search over reasoning paths, enabling exploration and backtracking for complex problem solving | [arXiv:2305.10601](https://arxiv.org/abs/2305.10601) |
| ReAct: Synergizing Reasoning and Acting in Language Models | Yao et al. | 2022 | Combined reasoning traces with action steps, establishing the Reason+Act paradigm widely used in LLM agent architectures | [arXiv:2210.03629](https://arxiv.org/abs/2210.03629) |
| Toolformer: Language Models Can Teach Themselves to Use Tools | Schick et al. | 2023 | Showed that LLMs can learn when and how to call external tools (calculators, search, APIs) by self-supervised training on API call annotations | [arXiv:2302.04761](https://arxiv.org/abs/2302.04761) |
| Constitutional AI: Harmlessness from AI Feedback | Bai et al. | 2022 | Introduced a method for training AI systems using AI-generated feedback guided by a set of principles, reducing reliance on human labelers | [arXiv:2212.08073](https://arxiv.org/abs/2212.08073) |
| DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning | DeepSeek-AI | 2025 | Demonstrated that pure RL (without supervised fine-tuning on CoT data) can develop strong reasoning, and distilled reasoning into smaller models | [arXiv:2501.12948](https://arxiv.org/abs/2501.12948) |
| Direct Preference Optimization: Your Language Model is Secretly a Reward Model (DPO) | Rafailov et al. | 2023 | Simplified RLHF by reframing it as a classification problem on preference pairs, eliminating the need for a separate reward model | [arXiv:2305.18290](https://arxiv.org/abs/2305.18290) |
| LoRA: Low-Rank Adaptation of Large Language Models | Hu et al. | 2021 | Introduced low-rank weight updates for efficient fine-tuning, reducing trainable parameters by orders of magnitude while maintaining performance | [arXiv:2106.09685](https://arxiv.org/abs/2106.09685) |
| Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena | Zheng et al. | 2023 | Proposed using strong LLMs as evaluators and introduced MT-Bench and Chatbot Arena for systematic model comparison | [arXiv:2306.05685](https://arxiv.org/abs/2306.05685) |
| A Survey on Hallucination in Large Language Models | Huang et al. | 2023 | Comprehensive taxonomy and analysis of hallucination in LLMs, covering causes, detection methods, and mitigation strategies | [arXiv:2311.05232](https://arxiv.org/abs/2311.05232) |

---

## Reading Suggestions

**If you read only five papers, read these:**

1. Attention Is All You Need (Vaswani et al., 2017) -- the architecture behind everything
2. Language Models are Few-Shot Learners (Brown et al., 2020) -- in-context learning
3. Retrieval-Augmented Generation (Lewis et al., 2020) -- the RAG paradigm
4. Chain-of-Thought Prompting (Wei et al., 2022) -- reasoning in LLMs
5. ReAct (Yao et al., 2022) -- agents and tool use

**For deeper study:** work through the foundational papers chronologically (Word2Vec through InstructGPT) to build a clear mental model of how the field evolved.
