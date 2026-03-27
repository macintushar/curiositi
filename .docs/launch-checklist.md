# Curiositi Launch Checklist

**Last updated**: 2026-03-24
**Target**: Self-hosted v1 launch on r/selfhosted + HN Show HN

---

## Pages & Functionality

### Landing Page (Unauthenticated Home)
- [x] Clear value proposition visible without scrolling
- [x] "Get Started" or "Sign Up" CTA works
- [x] Redirects authenticated users to their workspace
- [x] Works on mobile (responsive)

### Authentication Pages

#### Sign Up Page
- [x] Email/password signup works
- [x] Google OAuth signup works
- [x] Form validation shows clear errors
- [x] Password requirements are clear
- [x] Redirects to workspace creation or selection after signup

#### Login Page
- [x] Email/password login works
- [x] Google OAuth login works
- [x] "Forgot password" link works
- [x] Form validation shows clear errors
- [x] Redirects to last visited workspace or workspace selection
- [x] Session persists across browser restarts

#### Password Reset Page
- [x] Password reset email sends (requires email service configured)
- [x] Reset link works and isn't expired
- [x] New password is saved correctly
- [x] User can log in with new password

### Workspace Selection Page
- [x] Lists all workspaces user belongs to
- [x] Shows workspace name and member count
- [x] "Create new workspace" option works
- [x] Clicking a workspace redirects to that workspace
- [x] Last visited workspace is remembered (optional but nice)

### Create Workspace Page
- [x] Workspace name can be entered
- [x] Workspace is created successfully
- [x] User is added as owner/admin
- [x] Redirects to new workspace after creation

### Workspace Main Page (Dashboard)
- [x] Shows workspace name and navigation
- [x] Lists spaces within workspace
- [x] "Create new space" option works
- [x] Shows recent files or activity (optional)
- [x] Workspace settings accessible

### Space/Files Page
- [x] Lists all files in the space
- [x] File upload works (drag & drop + click)
- [x] File types are validated (show error for unsupported types)
- [x] Upload progress is visible
- [x] Files show name, type, size, upload date
- [x] Files can be deleted
- [x] Files can be previewed (text, markdown, PDF, images)
- [ ] Pagination or infinite scroll works for many files

### File Detail/Preview Page
- [x] File content is displayed
- [x] File metadata is visible (name, type, size, date)
- [x] "Download" option works
- [x] "Delete" option works with confirmation
- [x] Back navigation returns to space

### Search Page
- [x] Search input is prominent (Command palette Cmd+K)
- [x] Semantic search returns relevant results
- [x] Full text search returns relevant results (filename matching)
- [x] Search results show file name and snippet
- [x] Clicking result opens file detail
- [x] Search works with empty query (shows all or recent)
- [x] Search is fast enough (<2 seconds)
- [x] Search filters by space (via commander)

### AI Chat Page
- [ ] Chat input is visible
- [ ] Chat sends message and shows response
- [ ] Chat uses context from uploaded files
- [ ] Chat shows which files were used as context (optional but helpful)
- [ ] Chat history is preserved during session
- [ ] Chat works with Ollama (local LLM)
- [ ] Chat works with OpenAI (cloud LLM)
- [ ] Clear error messages if LLM is unavailable
- [ ] "New chat" option clears history

### Settings Page

#### User Settings
- [x] User can change name
- [x] User can change email
- [ ] User can change password
- [ ] User can delete their account (optional)

#### Workspace Settings
- [ ] Workspace name can be changed
- [ ] Workspace can be deleted (with confirmation)
- [x] Invite members works
- [x] Remove members works
- [ ] Member roles can be changed (admin/member)

### Invite/Accept Flow
- [x] Invite email sends
- [x] Invite link works
- [x] New user can create account via invite
- [x] Existing user can accept invite
- [x] Invite expires after reasonable time
- [x] Invite shows workspace name

### Browser Extension

#### Popup/Interface
- [ ] Extension icon shows in browser toolbar
- [ ] Clicking icon opens extension popup
- [ ] Popup shows current page URL/title
- [ ] "Save to Curiositi" button works
- [ ] Workspace/space selection works
- [ ] Success/error message shows after save

#### Save Functionality
- [ ] Page content is extracted correctly
- [ ] Page is saved to selected workspace/space
- [ ] Saved page appears in Curiositi search
- [ ] Saved page content is searchable

---

## File Processing

### Supported File Types
- [x] PDF files upload and extract text
- [x] Images (PNG, JPG, JPEG, GIF, WebP, SVG) upload and extract text via vision
- [x] Text files (.txt, .md, .csv, .json, .xml, .yaml, .html) upload and process
- [x] Unsupported file types show clear error message

### Processing Pipeline
- [x] File uploads to S3/storage
- [x] Text extraction runs correctly
- [x] Embeddings are generated (OpenAI text-embedding-3-small)
- [x] File appears in search after processing
- [x] Processing errors are handled gracefully
- [x] Files can be re-processed if needed

---

## Deployment

### Docker
- [ ] `docker-compose up` works with zero configuration
- [ ] All services start correctly (frontend, backend, database, queue)
- [ ] Environment variables are documented
- [ ] Secrets are not hardcoded in repo
- [ ] Data persists across container restarts
- [ ] Logs are accessible for debugging

### Configuration
- [ ] Ollama endpoint is configurable
- [x] OpenAI API key is configurable
- [x] S3/storage endpoint is configurable
- [x] Database connection is configurable
- [ ] All config options have sensible defaults

---

## Documentation

### README
- [ ] Clear one-line description at top
- [ ] Screenshot or GIF showing the product
- [ ] Quick start (5minutes to run)
- [ ] Prerequisites listed (Docker, OpenAI API key)
- [ ] Environment variables documented with examples
- [ ] Architecture diagram (optional but helpful)
- [ ] License specified

### Setup Guide
- [ ] Step-by-step installation instructions
- [ ] How to configure OpenAI API key
- [ ] How to configure S3/storage
- [ ] Troubleshooting common issues
- [ ] How to update to new versions

---

## Testing

### Smoke Tests (Manual)
- [ ] Fresh install works (delete all data, start fresh)
- [x] Upload a PDF, search for content, verify results
- [x] Upload an image, search for content, verify results
- [ ] Ask a question in chat, verify response uses file context (N/A - chat not implemented)
- [ ] Save a page via browser extension, verify it appears in search (N/A - extension not implemented)
- [x] Invite a new user, verify they can access workspace

### Edge Cases
- [ ] Large files (>10MB) don't crash the system
- [ ] Duplicate files are handled gracefully
- [x] Invalid file types show clear error
- [x] Search with no results shows helpful message
- [ ] Chat with no files shows helpful message (N/A - chat not implemented)
- [ ] Network errors show clear error (not just spinner)
- [ ] Session expiry is handled gracefully

---

## Launch Preparation

### r/selfhosted Post
- [ ] Title follows format: "[Project Name] - [One-line description]"
- [ ] Body explains what it does, why it exists, tech stack
- [ ] Link to GitHub repo
- [ ] Screenshots/GIF included
- [ ] Honest about maturity level (v1, early stage)
- [ ] Note: AIchat feature is NOT yet implemented
- [ ] Note: Browser extension is NOT yet implemented
- [ ] Respond to comments promptly

### HN Show HN Post
- [ ] Title follows format: "Show HN: [Project Name] - [One-line description]"
- [ ] Body explains what it does, why you built it, what you learned
- [ ] Link to GitHub repo
- [ ] Technical depth (architecture decisions, challenges)
- [ ] Honest about it being a portfolio/learning project
- [ ] Honest about missing features (no chat, no extension yet)

### GitHub
- [ ] Repo description is clear
- [ ] Topics/tags added (ai, semantic-search, self-hosted, etc.)
- [ ] LICENSE file exists
- [ ] CONTRIBUTING.md exists (even if minimal)
- [ ] Issues are enabled

---

## Post-Launch

### Monitoring
- [ ] Basic error logging works
- [ ] Can see if deployment is healthy
- [ ] Know how to check logs

### Feedback
- [ ] GitHub Issues are enabled for feedback
- [ ] README links to Issues for bug reports
- [ ] Have a plan for responding to feedback

---

## Quick Verification Script

Run this to verify core functionality:

```bash
# 1. Start fresh
docker-compose down -v
docker-compose up -d

# 2. Create account
# (Manual: open browser, signup)

# 3. Create workspace
# (Manual: create a workspace)

# 4. Upload test file
# (Manual: upload a PDF)

# 5. Search for content
# (Manual: search for a term from the PDF - use Cmd+K)

# 6. Test chat
# (N/A - chat not implemented yet)

# 7. Test browser extension
# (N/A - extension not implemented yet)

# 8. Invite a user
# (Manual: invite another email, verify they can join)
```

---

## Launch Day Checklist

- [ ] All core functionality verified
- [ ] README is complete and clear
- [ ] Docker deployment tested on fresh machine
- [ ] Demo video ready (showing working product)
- [ ] Screenshots/GIF ready for posts
- [ ] r/selfhosted post drafted
- [ ] HN Show HN post drafted
- [ ] Ready to respond to comments for 24-48 hours

## Feature Status Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Authentication (Email/OAuth) | ✅ Complete | Sign up, login, password reset all working |
| Workspace Management | ✅ Complete | Create, switch, settings, members |
| File Upload | ✅ Complete | PDF, images, text files supported |
| Semantic Search | ✅ Complete | OpenAI embeddings +filename search |
| File Preview | ✅ Complete | Text, markdown, PDF, images |
| Spaces/Folders | ✅ Complete | Nested spaces with emoji icons |
| Member Invitations | ✅ Complete | Email invites, acceptance flow |
| Settings | ⚠️ Partial | Profile name/avatar works; workspace rename/delete not implemented |
| AI Chat | ❌ Not Started | No conversational AI feature |
| Browser Extension | ❌ Not Started | No extension code |
| Docker Deployment | ❓ Untested | Needs verification |
| Documentation | ❌ Not Started | README, setup guide needed |

## Cloud Demo (Post-Launch)

- [ ] Only build if users ask for it
- [ ] BYOK approach (bring your own API key)
- [ ] Anonymous sessions with DB storage
- [ ] Clear CTA: "Self-Host for Privacy"

---

## Notes

- This is v1. It doesn't need to be perfect.
- Focus on core functionality working reliably.
- Documentation matters more than features for v1.
- Be honest about maturity level in posts.
- Respond to feedback quickly in first 48 hours.
