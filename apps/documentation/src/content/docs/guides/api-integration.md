---
title: API Integration Guide
description: Learn how to integrate Curiositi's API into your applications, workflows, and tools.
---

This guide covers integrating Curiositi into your applications, automating document processing, and building custom interfaces.

## Authentication Setup

Before making API calls, you need to authenticate with Curiositi.

### Getting Your Session Cookie

1. **Log in** to Curiositi through the web interface
2. **Open browser developer tools** (F12)
3. **Go to Application/Storage → Cookies**
4. **Find the session cookie** (usually named `better-auth.session`)
5. **Copy the cookie value**

### Using the Cookie in API Calls

```bash
# Include in curl requests
curl -X GET https://your-domain.com/api/v1/spaces \
  -H "Cookie: better-auth.session=your-session-value"
```

```javascript
// In JavaScript/Node.js
const response = await fetch('https://your-domain.com/api/v1/spaces', {
  headers: {
    'Cookie': 'better-auth.session=your-session-value'
  }
});
```

## Basic Integration Examples

### JavaScript/TypeScript Client

```typescript
class CuriositiClient {
  constructor(private baseUrl: string, private sessionCookie: string) {}

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    return fetch(url, {
      ...options,
      headers: {
        'Cookie': this.sessionCookie,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
  }

  // List all spaces
  async getSpaces() {
    const response = await this.request('/api/v1/spaces');
    return response.json();
  }

  // Upload a file
  async uploadFile(file: File, spaceId: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('space_id', spaceId);

    const response = await this.request('/api/v1/files/upload', {
      method: 'POST',
      body: formData,
      headers: {
        // Let browser set content-type for FormData
        'Content-Type': undefined
      }
    });
    return response.json();
  }

  // Search with streaming
  async *searchStream(query: string, spaceIds: string[] = []) {
    const response = await this.request('/api/v1/search/stream', {
      method: 'POST',
      body: JSON.stringify({
        input: query,
        space_ids: spaceIds,
        model: 'openai:gpt-4o-mini',
        provider: 'openai'
      })
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error('No response body');

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              yield data;
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

// Usage
const client = new CuriositiClient(
  'https://your-domain.com/api/v1',
  'better-auth.session=your-session-value'
);

// List spaces
const spaces = await client.getSpaces();
console.log('Your spaces:', spaces.data);

// Upload a file
const fileInput = document.getElementById('file-input') as HTMLInputElement;
if (fileInput.files?.[0]) {
  const result = await client.uploadFile(fileInput.files[0], 'space-uuid');
  console.log('Upload result:', result);
}

// Streaming search
for await (const chunk of client.searchStream('What are my project requirements?')) {
  if (chunk.type === 'text') {
    process.stdout.write(chunk.content);
  }
}
```

### Python Integration

```python
import requests
import json
from typing import List, Dict, Any, Iterator

class CuriositiAPI:
    def __init__(self, base_url: str, session_cookie: str):
        self.base_url = base_url.rstrip('/')
        self.session_cookie = session_cookie

    def _request(self, endpoint: str, method: str = 'GET', **kwargs) -> Dict[str, Any]:
        url = f"{self.base_url}{endpoint}"
        headers = kwargs.pop('headers', {})
        headers['Cookie'] = self.session_cookie

        response = requests.request(method, url, headers=headers, **kwargs)
        response.raise_for_status()
        return response.json()

    def get_spaces(self) -> List[Dict[str, Any]]:
        """Get all spaces for the user."""
        response = self._request('/api/v1/spaces')
        return response['data']

    def create_space(self, name: str, description: str = "", icon: str = "📁") -> Dict[str, Any]:
        """Create a new space."""
        data = {
            "name": name,
            "description": description,
            "icon": icon
        }
        response = self._request('/api/v1/spaces', method='POST', json=data)
        return response['data']

    def upload_file(self, file_path: str, space_id: str) -> Dict[str, Any]:
        """Upload a file to a space."""
        with open(file_path, 'rb') as f:
            files = {'file': f}
            data = {'space_id': space_id}
            response = self._request('/api/v1/files/upload', method='POST',
                                   files=files, data=data)
        return response['data']

    def search(self, query: str, space_ids: List[str] = None,
               model: str = 'openai:gpt-4o-mini') -> Dict[str, Any]:
        """Perform a synchronous search."""
        data = {
            'input': query,
            'model': model,
            'provider': 'openai'
        }
        if space_ids:
            data['space_ids'] = space_ids

        return self._request('/api/v1/search', method='POST', json=data)

    def search_stream(self, query: str, space_ids: List[str] = None) -> Iterator[Dict[str, Any]]:
        """Perform a streaming search."""
        data = {
            'input': query,
            'model': 'openai:gpt-4o-mini',
            'provider': 'openai'
        }
        if space_ids:
            data['space_ids'] = space_ids

        response = requests.post(
            f"{self.base_url}/api/v1/search/stream",
            json=data,
            headers={'Cookie': self.session_cookie},
            stream=True
        )
        response.raise_for_status()

        for line in response.iter_lines():
            if line.startswith(b'data: '):
                try:
                    data = json.loads(line[6:])
                    yield data
                except json.JSONDecodeError:
                    continue

# Usage example
api = CuriositiAPI(
    base_url='https://your-domain.com/api/v1',
    session_cookie='better-auth.session=your-session-value'
)

# Create a space
space = api.create_space("API Integration Test", "Testing API integration")
print(f"Created space: {space['name']}")

# Upload a file
result = api.upload_file('/path/to/document.pdf', space['id'])
print(f"Uploaded file: {result['name']}")

# Search
results = api.search("What does this document contain?", space_ids=[space['id']])
print(f"Search results: {results['output']}")

# Streaming search
print("Streaming search:")
for chunk in api.search_stream("Summarize the key points"):
    if chunk.get('type') == 'text':
        print(chunk['content'], end='')
print()  # New line
```

## Advanced Integration Patterns

### Document Processing Pipeline

```python
import time
from pathlib import Path

class DocumentProcessor:
    def __init__(self, api_client: CuriositiAPI):
        self.api = api_client

    def process_directory(self, directory_path: str, space_id: str) -> List[Dict[str, Any]]:
        """Process all documents in a directory."""
        directory = Path(directory_path)
        uploaded_files = []

        # Supported extensions
        supported_ext = {'.pdf', '.docx', '.txt', '.md', '.csv'}

        for file_path in directory.rglob('*'):
            if file_path.suffix.lower() in supported_ext:
                print(f"Uploading {file_path.name}...")
                try:
                    result = self.api.upload_file(str(file_path), space_id)
                    uploaded_files.append(result)

                    # Wait a bit between uploads to avoid rate limits
                    time.sleep(1)
                except Exception as e:
                    print(f"Failed to upload {file_path.name}: {e}")

        return uploaded_files

    def wait_for_processing(self, file_ids: List[str], timeout: int = 300) -> bool:
        """Wait for files to finish processing."""
        start_time = time.time()

        while time.time() - start_time < timeout:
            # Check processing status (implement based on your API)
            # This is a simplified example
            time.sleep(10)

        return True

# Usage
processor = DocumentProcessor(api)
files = processor.process_directory('/path/to/documents', 'space-uuid')
print(f"Uploaded {len(files)} files")
```

### Chatbot Integration

```javascript
class CuriositiChatbot {
  constructor(apiClient) {
    this.api = apiClient;
    this.currentThread = null;
  }

  async startConversation() {
    const response = await this.api._request('/api/v1/threads', 'POST');
    this.currentThread = response.data;
    return this.currentThread;
  }

  async sendMessage(message, onChunk = null) {
    if (!this.currentThread) {
      await this.startConversation();
    }

    const chunks = [];
    for await (const chunk of this.api.searchStream(message, [], this.currentThread.id)) {
      chunks.push(chunk);
      if (onChunk) {
        onChunk(chunk);
      }
    }

    return this._assembleResponse(chunks);
  }

  _assembleResponse(chunks) {
    let fullText = '';
    const sources = [];

    for (const chunk of chunks) {
      if (chunk.type === 'text') {
        fullText += chunk.content;
      } else if (chunk.type === 'tool_result' && chunk.results) {
        sources.push(...chunk.results);
      }
    }

    return { text: fullText, sources };
  }
}

// Web integration example
class WebChatWidget {
  constructor(containerId, apiConfig) {
    this.container = document.getElementById(containerId);
    this.api = new CuriositiClient(apiConfig.baseUrl, apiConfig.sessionCookie);
    this.chatbot = new CuriositiChatbot(this.api);
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="chat-widget">
        <div class="chat-messages" id="messages"></div>
        <div class="chat-input">
          <input type="text" id="message-input" placeholder="Ask about your documents...">
          <button id="send-button">Send</button>
        </div>
      </div>
    `;

    this.messagesEl = document.getElementById('messages');
    this.inputEl = document.getElementById('message-input');
    this.sendButton = document.getElementById('send-button');

    this.sendButton.addEventListener('click', () => this.sendMessage());
    this.inputEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
  }

  async sendMessage() {
    const message = this.inputEl.value.trim();
    if (!message) return;

    // Add user message
    this.addMessage('user', message);
    this.inputEl.value = '';

    // Show typing indicator
    this.addTypingIndicator();

    try {
      let responseText = '';
      const result = await this.chatbot.sendMessage(message, (chunk) => {
        if (chunk.type === 'text') {
          responseText += chunk.content;
          this.updateTypingIndicator(responseText);
        }
      });

      this.removeTypingIndicator();
      this.addMessage('assistant', result.text, result.sources);
    } catch (error) {
      this.removeTypingIndicator();
      this.addMessage('error', 'Sorry, I encountered an error. Please try again.');
    }
  }

  addMessage(role, content, sources = []) {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${role}`;

    let html = `<div class="message-content">${this.formatText(content)}</div>`;

    if (sources.length > 0) {
      html += '<div class="message-sources">';
      html += '<h4>Sources:</h4>';
      html += '<ul>';
      sources.forEach(source => {
        html += `<li><strong>${source.title}</strong>: ${source.content.substring(0, 100)}...</li>`;
      });
      html += '</ul></div>';
    }

    messageEl.innerHTML = html;
    this.messagesEl.appendChild(messageEl);
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
  }

  addTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'message assistant typing';
    indicator.id = 'typing-indicator';
    indicator.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
    this.messagesEl.appendChild(indicator);
  }

  updateTypingIndicator(text) {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
      indicator.innerHTML = `<div class="message-content">${this.formatText(text)}</div>`;
    }
  }

  removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
  }

  formatText(text) {
    // Basic markdown-like formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }
}

// Initialize the chat widget
const chatWidget = new WebChatWidget('chat-container', {
  baseUrl: 'https://your-domain.com/api/v1',
  sessionCookie: 'better-auth.session=your-session-value'
});
```

### Slack/Discord Bot Integration

```python
import asyncio
from slack_sdk import WebClient
from slack_sdk.socket_mode import SocketModeClient
from slack_sdk.socket_mode.request import SocketModeRequest

class CuriositiSlackBot:
    def __init__(self, slack_token: str, curiositi_api: CuriositiAPI):
        self.slack_client = WebClient(token=slack_token)
        self.curiositi = curiositi_api
        self.socket_client = SocketModeClient(
            app_token=slack_token,
            web_client=self.slack_client
        )

    def start(self):
        self.socket_client.message_listener = self.handle_message
        self.socket_client.connect()
        print("Slack bot started!")

    async def handle_message(self, client, req: SocketModeRequest):
        if req.type != "events_api":
            return

        event = req.payload.get("event", {})
        if event.get("type") != "message" or event.get("subtype"):
            return

        channel = event.get("channel")
        text = event.get("text", "").strip()

        # Check if message mentions the bot
        if not self._is_mention(text):
            return

        # Remove bot mention from text
        question = self._clean_mention(text)

        # Send typing indicator
        await client.typing(channel=channel)

        try:
            # Search Curiositi
            response_text = ""
            for chunk in self.curiositi.search_stream(question):
                if chunk.get('type') == 'text':
                    response_text += chunk['content']

            # Send response back to Slack
            if len(response_text) > 4000:  # Slack message limit
                response_text = response_text[:4000] + "..."

            await client.chat_postMessage(
                channel=channel,
                text=response_text,
                thread_ts=event.get("ts")  # Reply in thread
            )

        except Exception as e:
            await client.chat_postMessage(
                channel=channel,
                text=f"Sorry, I encountered an error: {str(e)}"
            )

    def _is_mention(self, text: str) -> bool:
        # Check if message mentions the bot
        return "@CuriositiBot" in text or text.startswith("!")

    def _clean_mention(self, text: str) -> str:
        # Remove bot mention from message
        return text.replace("@CuriositiBot", "").replace("!", "").strip()

# Usage
bot = CuriositiSlackBot(
    slack_token="xoxb-your-slack-bot-token",
    curiositi_api=api  # From earlier example
)

# Start the bot
bot.start()

# Keep the script running
import signal
signal.pause()
```

## Webhook Integration

Set up webhooks to receive notifications about Curiositi events (planned feature):

```javascript
// Webhook receiver example
const express = require('express');
const app = express();

app.use(express.json());

// Verify webhook signature (when implemented)
function verifySignature(req, res, next) {
  const signature = req.headers['x-curiositi-signature'];
  // Verification logic here
  next();
}

app.post('/webhooks/curiositi', verifySignature, (req, res) => {
  const event = req.body;

  switch (event.type) {
    case 'file.uploaded':
      console.log(`File uploaded: ${event.data.fileName}`);
      // Trigger processing pipeline
      break;

    case 'file.processed':
      console.log(`File processed: ${event.data.fileId}`);
      // Update external systems
      break;

    case 'search.completed':
      console.log(`Search completed with ${event.data.resultCount} results`);
      // Log analytics
      break;

    default:
      console.log(`Unknown event type: ${event.type}`);
  }

  res.json({ received: true });
});

app.listen(3000, () => {
  console.log('Webhook receiver listening on port 3000');
});
```

## Best Practices

### Error Handling

```javascript
async function robustApiCall(apiCall, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      if (error.response?.status === 429) {
        // Rate limited, wait and retry
        const waitTime = Math.pow(2, i) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      if (error.response?.status >= 500) {
        // Server error, retry
        continue;
      }

      // Client error or other issue, don't retry
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

// Usage
const spaces = await robustApiCall(() => api.getSpaces());
```

### Rate Limiting

```javascript
class RateLimiter {
  constructor(requestsPerMinute = 60) {
    this.requestsPerMinute = requestsPerMinute;
    this.requests = [];
  }

  async waitForSlot() {
    const now = Date.now();
    // Remove old requests
    this.requests = this.requests.filter(time => now - time < 60000);

    if (this.requests.length >= this.requestsPerMinute) {
      // Wait until oldest request expires
      const waitTime = 60000 - (now - this.requests[0]);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.requests.push(now);
  }
}

// Usage
const limiter = new RateLimiter(50); // 50 requests per minute

async function makeApiCall() {
  await limiter.waitForSlot();
  return api.search('query');
}
```

### Monitoring & Logging

```javascript
class CuriositiMonitor {
  constructor(apiClient) {
    this.api = apiClient;
    this.metrics = {
      requests: 0,
      errors: 0,
      latency: []
    };
  }

  async monitoredRequest(endpoint, options = {}) {
    const startTime = Date.now();
    this.metrics.requests++;

    try {
      const result = await this.api._request(endpoint, options);
      const latency = Date.now() - startTime;
      this.metrics.latency.push(latency);

      console.log(`API Call: ${endpoint} - ${latency}ms`);
      return result;
    } catch (error) {
      this.metrics.errors++;
      console.error(`API Error: ${endpoint} - ${error.message}`);
      throw error;
    }
  }

  getMetrics() {
    const avgLatency = this.metrics.latency.reduce((a, b) => a + b, 0) / this.metrics.latency.length;
    return {
      totalRequests: this.metrics.requests,
      errorRate: this.metrics.errors / this.metrics.requests,
      averageLatency: avgLatency,
      p95Latency: this.metrics.latency.sort((a, b) => a - b)[Math.floor(this.metrics.latency.length * 0.95)]
    };
  }
}
```

## Security Considerations

### API Key Management

- **Never hardcode API keys** in client-side code
- **Use environment variables** for configuration
- **Rotate keys regularly** and update integrations
- **Monitor key usage** for suspicious activity

### Session Management

- **Implement session refresh** logic
- **Handle session expiration** gracefully
- **Secure cookie storage** in web applications
- **Use HTTPS** for all API communications

### Data Protection

- **Validate file uploads** on both client and server
- **Implement file type restrictions** beyond API limits
- **Scan uploaded content** for sensitive information
- **Encrypt data in transit and at rest**

## Troubleshooting Integration Issues

### Common Problems

**401 Unauthorized**
- Check session cookie validity
- Ensure cookie is being sent with requests
- Try logging in again to refresh session

**429 Rate Limited**
- Implement rate limiting in your client
- Add exponential backoff for retries
- Consider upgrading your plan for higher limits

**413 Payload Too Large**
- Check file size limits (50MB default)
- Compress files before upload
- Split large files into smaller chunks

**500 Internal Server Error**
- Check server logs for detailed error information
- Verify API payload format
- Ensure all required parameters are included

### Debugging Tips

```javascript
// Enable detailed logging
const originalRequest = api._request;
api._request = async function(...args) {
  console.log('API Request:', ...args);
  try {
    const result = await originalRequest.apply(this, args);
    console.log('API Response:', result);
    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
```

## Getting Help

- **API Documentation**: Full reference at `/api/README.md`
- **GitHub Issues**: Report integration bugs
- **GitHub Discussions**: Ask integration questions
- **Example Repositories**: Check for community integrations

This guide covers the fundamentals of integrating with Curiositi. For more advanced use cases or specific framework integrations, check the community resources or create a GitHub issue.