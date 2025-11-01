---
title: Setting Up Your Knowledge Base
description: Learn how to create spaces, upload documents, and organize your knowledge for effective AI-powered search and chat.
---

This guide will walk you through setting up your first knowledge base in Curiositi. By the end, you'll have organized documents and be able to ask questions about your content.

## Prerequisites

- A Curiositi account and running instance
- Some documents to upload (PDFs, Office files, or text documents)

## Step 1: Create Your First Space

Spaces help you organize your documents by topic, project, or department.

1. **Log in** to your Curiositi instance
2. **Click "Create Space"** in the sidebar or main dashboard
3. **Give it a name** like "Project Documentation" or "Company Policies"
4. **Add an icon** (optional) - choose from emojis or upload a custom icon
5. **Add a description** to explain what this space contains

**Tip:** Start with a broad space like "General Knowledge" if you're not sure how to organize yet. You can always create more spaces later and move files between them.

## Step 2: Upload Your Documents

Now let's add some content to your space.

1. **Navigate to your space** by clicking on it in the sidebar
2. **Click "Upload Files"** or drag and drop files onto the space
3. **Select your documents** - Curiositi supports:
   - **PDF files** (.pdf)
   - **Office documents** (.docx, .pptx, .xlsx)
   - **Text files** (.txt, .md, .csv)

**What happens next:**
- Files are uploaded and stored securely
- Text content is extracted automatically
- Documents are split into meaningful chunks
- AI embeddings are generated for semantic search

**Upload Tips:**
- **File size limit**: 50MB per file
- **Batch uploads**: Select multiple files at once
- **Progress tracking**: Watch the upload progress and processing status
- **Processing time**: Large documents may take a few minutes to process

## Step 3: Verify Upload Success

Make sure your documents were processed correctly.

1. **Check the file list** in your space - you should see all uploaded files
2. **Look for status indicators**:
   - 🟢 **Completed**: File processed successfully
   - 🟡 **Processing**: Still being analyzed
   - 🔴 **Failed**: Something went wrong

3. **Click on a file** to see details like:
   - File size and type
   - Upload date
   - Processing status
   - Preview (for text-based files)

## Step 4: Start Chatting with Your Knowledge

Now that you have documents uploaded, let's test the AI agent.

1. **Start a new conversation** by clicking the chat icon or "New Chat"
2. **Ask a question** about your documents, for example:
   - "What are the key points from the project proposal?"
   - "Summarize the quarterly report"
   - "What does our company policy say about remote work?"

**How the AI agent works:**
- **Immediate response**: Answers start streaming right away
- **Smart search**: Automatically searches your documents when needed
- **Source citations**: Shows which documents the information came from
- **Web search**: Can search the internet for additional context (if enabled)

## Step 5: Organize Multiple Spaces

As your knowledge base grows, create more spaces for better organization.

### Example Space Structure

```
📁 Company Knowledge
├── 📋 Company Policies
├── 📊 Financial Reports
├── 👥 HR Documents
└── 📈 Strategic Plans

📁 Project Work
├── 🚀 Product Launch
├── 💻 Development Docs
└── 🎯 Marketing Materials

📁 Personal
├── 📚 Research Papers
├── 💡 Ideas & Notes
└── 📝 Meeting Notes
```

### Moving Files Between Spaces

1. **Go to the file's current space**
2. **Click the menu (⋯) next to the file**
3. **Select "Move to Space"**
4. **Choose the destination space**

## Step 6: Advanced Features

### Filtering Search Results

When asking questions, you can focus on specific spaces:

- **Space-specific questions**: "According to the HR policies, what is our vacation policy?"
- **Cross-space queries**: The agent automatically searches relevant spaces

### Conversation Threads

- **Keep context**: Each conversation thread remembers previous questions
- **Follow-up questions**: Ask "What about last quarter?" and the agent understands the context
- **Thread management**: Rename, delete, or organize your conversation threads

### File Management

- **Download originals**: Access your original files anytime
- **Delete files**: Remove documents you no longer need
- **File details**: See processing status, file size, and upload date

## Best Practices

### Document Organization

**Do:**
- Use descriptive file names
- Group related documents in the same space
- Create spaces for different projects or departments
- Regularly review and clean up outdated documents

**Don't:**
- Upload sensitive information without proper access controls
- Mix unrelated documents in the same space
- Use generic names like "document.pdf"

### Content Quality

**For best results:**
- Upload well-structured documents with clear headings
- Use consistent formatting and terminology
- Include tables of contents or indexes in long documents
- Keep documents focused on specific topics

### Search Optimization

**Write effective questions:**
- Be specific: "What is the deadline for Q4 deliverables?" vs "What's the deadline?"
- Use context: "In the marketing plan, what are our target demographics?"
- Ask follow-ups: Build on previous answers in conversation threads

## Troubleshooting

### Upload Issues

**File won't upload:**
- Check file size (max 50MB)
- Verify supported file type
- Ensure stable internet connection

**Processing fails:**
- Try re-uploading the file
- Check if the file is corrupted or password-protected
- Contact support for persistent issues

### Search Problems

**No relevant results:**
- Check if documents were processed successfully
- Try rephrasing your question
- Ensure you're asking about content that exists in your documents

**Slow responses:**
- Large documents take longer to process initially
- Complex questions may require more processing time
- Check your internet connection

## Next Steps

Now that you have a working knowledge base:

1. **[Invite team members](../self-hosting.md)** to collaborate
2. **[Set up API access](../api/README.md)** for integrations
3. **[Configure web search](../env.md)** for current information
4. **[Explore advanced features](../llm-agent.md)** like different AI models

## Getting Help

- **Documentation**: Check the [troubleshooting guide](../troubleshooting.md)
- **Community**: Join [GitHub Discussions](https://github.com/macintushar/curiositi/discussions)
- **Issues**: Report bugs on [GitHub](https://github.com/macintushar/curiositi/issues)

Your knowledge base is now ready! Start exploring your documents with AI-powered search and chat.
