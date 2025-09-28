export type FAQ = {
  question: string;
  answer: string;
};

export const faqs: FAQ[] = [
  {
    question: "What are Spaces in Curiositi?",
    answer:
      "Spaces are isolated environments for organizing and querying your documents. Each space acts as a separate knowledge base, allowing you to group related documents together and perform targeted searches within that context.",
  },
  {
    question: "How do documents in a Space work?",
    answer:
      "When you upload documents to a Space, they are processed, split into chunks, and embedded into a vector store. This allows for semantic search and retrieval of relevant content when you ask questions. Each document maintains its association with the Space it belongs to.",
  },
  {
    question: "Can I use multiple Spaces?",
    answer:
      "Yes! You can create multiple Spaces to organize different types of documents or topics. For example, you might have separate Spaces for technical documentation, research papers, and business reports.",
  },
  {
    question: "What happens when I upload a file?",
    answer:
      "When you upload a file, Curiositi processes it by: 1) Validating the file type and format, 2) Extracting and cleaning the text content, 3) Splitting it into manageable chunks, 4) Generating embeddings for each chunk, and 5) Storing both the original file and its processed form.",
  },
  {
    question: "What file types can I upload?",
    answer: "Curiositi supports PDF, plain text, CSV, and Markdown files.",
  },
  {
    question: "How do I create and organize Spaces?",
    answer:
      "Use the Spaces API endpoint to create named spaces, then upload your documents into each space to keep your data organized and queries scoped appropriately.",
  },
  {
    question: "Which LLM and embedding providers are available?",
    answer:
      "Curiositi supports Ollama and OpenAI for both embeddings and completion. Configure your preferred providers via environment variables (DEFAULT_EMBEDDING_PROVIDER, OPENAI_API_KEY, OLLAMA_BASE_URL).",
  },
  {
    question: "How does the Retrieval-Augmented Generation (RAG) system work?",
    answer:
      "The agent determines whether to answer directly or retrieve context. In space mode, it searches your uploaded documents; in general mode, it queries the web via Firecrawl, then synthesizes a final response.",
  },
  {
    question: "How do I perform a search?",
    answer:
      "Use the POST /api/v1/search endpoint with your input, model, session_id, space_id, provider, and thread_id to search within a space. For web-only queries, use POST /api/v1/search/general without space_id.",
  },
];
