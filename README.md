# Curiositi

_Curiositi is your Digital Brain. Store anything you want, access it anytime, anywhere._

Currently, we support the following types of data:
- Text
    - PDF
    - Text-based Files like Markdown, HTML, etc.
    - Office Docs (Word, Excel, PowerPoint)
- Images
    - JPEG, PNG, GIF, etc.

## How it works

We use AI to generate metadata for your files. This metadata is then used to search for your files.
We generate embeddings for this metadata so that it can be used for semantic search.

## Roadmap
- [ ] Web Pages (DATA)
    - This requires us to scrape the web page, generate metadata for it, and then generate embeddings for the content and the metadata. Ideally this would use Firecrawl.
- [ ] Audio (DATA)
    - This requires us to transcribe the audio, generate metadata for it, and then generate embeddings for the content and the metadata.
- [ ] Video (DATA)
    - [ ] User Uploaded Videos
        - This requires us to transcribe the audio, generate metadata for it, and then generate embeddings for the content and the metadata
        - Extract frames from the video, pass them into a Vision-capable model and generate embeddings for them. This would work essentially on the same lines as image embedding.
    - [ ] YouTube Videos
        - This requires us to download the videos, transcribe the audio, generate metadata for it, and then generate embeddings for the content and the metadata
        - Extract frames from the video, pass them into a Vision-capable model and generate embeddings for them. This would work essentially on the same lines as image embedding.
- [ ] PWA of Platform (APP)
    - This would allow users to install the platform as a Progressive Web App for offline access and native-like experience.
- [ ] Browser Extension (APP)
    - This would allow users to save any text they come across on the web.
- [ ] Mobile App (APP)
    - This would function exactly the same as the web app.
