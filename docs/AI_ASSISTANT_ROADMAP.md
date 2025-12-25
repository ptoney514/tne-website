# TNE AI Assistant Coach - Architecture & Roadmap

## Overview

This document outlines the current state of the TNE AI Assistant Coach, proposed enhancements, and comparison to commercial solutions like Zendesk.

---

## Current State

### Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Chat Widget   │────▶│   Vercel API    │────▶│  Claude Haiku   │
│   (React)       │◀────│   /api/chat.js  │◀────│  (Anthropic)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │
        ▼
┌─────────────────┐
│  localStorage   │
│  (browser)      │
└─────────────────┘
```

### Components

| Component | Location | Purpose |
|-----------|----------|---------|
| ChatWidget | `react-app/src/components/chat/` | Floating button + panel UI |
| ChatPanel | Same | Message display, quick actions |
| ChatInput | Same | User input with 500 char limit |
| API Endpoint | `api/chat.js` | Handles Claude API calls |
| System Prompt | Hardcoded in `api/chat.js` | AI's knowledge base |

### Data Flow

1. User types message in ChatInput
2. Message sent to `/api/chat` (Vercel serverless function)
3. API sends conversation history + system prompt to Claude Haiku
4. Claude returns response
5. Response displayed in ChatPanel
6. Conversation saved to browser localStorage

### Current Features

- [x] Floating chat button on all public pages
- [x] Message history (persists in browser localStorage)
- [x] Quick action buttons (Practice schedule, Tryout dates, etc.)
- [x] Rate limiting (1 request/second)
- [x] Input validation (500 char max, 20 messages max)
- [x] Error handling with fallback contact info
- [x] Mobile responsive design

### Current Limitations

| Limitation | Impact |
|------------|--------|
| No conversation logging | Cannot review what users are asking |
| No analytics | No visibility into usage patterns |
| No feedback collection | Cannot measure satisfaction |
| Hardcoded knowledge base | Updates require code deployment |
| No admin dashboard | No central management interface |
| Client-side storage only | Conversations lost on device change |
| No escalation path | Users can't request human help |
| No session identification | Cannot track user journeys |

---

## Proposed Enhancement Phases

### Phase 1: Feedback & Basic Logging

**Goal**: Capture user satisfaction and enable conversation review

#### Features
- Thumbs up/down buttons after each AI response
- Log conversations to Supabase
- Basic admin view of recent conversations

#### Database Schema

```sql
-- Chat sessions
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL, -- Browser fingerprint or random ID
  started_at TIMESTAMPTZ DEFAULT NOW(),
  page_url TEXT,
  user_agent TEXT,
  ip_hash TEXT -- Hashed for privacy
);

-- Individual messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id),
  role TEXT NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  feedback TEXT, -- 'positive', 'negative', or NULL
  feedback_at TIMESTAMPTZ
);
```

#### UI Changes
- Add thumbs up/down icons after each assistant message
- Visual feedback when user rates a response

#### Effort: ~2-3 days

---

### Phase 2: Analytics Dashboard

**Goal**: Understand usage patterns and identify improvement areas

#### Features
- Message volume over time (daily/weekly/monthly)
- Most common questions (topic clustering)
- Feedback summary (satisfaction rate)
- Peak usage times
- Conversation length distribution

#### Admin Dashboard (`/admin/chat-analytics`)

```
┌────────────────────────────────────────────────────────────────┐
│  Chat Analytics                                     Last 30 days │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │     847      │  │    78%       │  │    2.3       │          │
│  │  Total Chats │  │ Satisfaction │  │ Avg Messages │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  Popular Topics                    Recent Conversations          │
│  ┌─────────────────────────────┐  ┌─────────────────────────┐  │
│  │ 1. Tryout dates (23%)       │  │ "When are tryouts?"     │  │
│  │ 2. Registration fees (19%)  │  │ 👍 2 min ago            │  │
│  │ 3. Practice schedule (15%)  │  │                         │  │
│  │ 4. Team levels (12%)        │  │ "How much does it cost?"│  │
│  │ 5. Contact info (11%)       │  │ 👎 15 min ago           │  │
│  └─────────────────────────────┘  └─────────────────────────┘  │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

#### Effort: ~3-4 days

---

### Phase 3: Knowledge Base Management

**Goal**: Allow admins to update AI knowledge without code changes

#### Features
- Admin UI to edit knowledge base entries
- Categorized information (Teams, Schedule, Fees, Contact, etc.)
- Version history for changes
- Preview mode to test changes before publishing

#### Database Schema

```sql
-- Knowledge base entries
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL, -- 'about', 'teams', 'schedule', 'fees', etc.
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- Knowledge base versions (audit trail)
CREATE TABLE knowledge_base_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID REFERENCES knowledge_base(id),
  content TEXT NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  changed_by UUID REFERENCES profiles(id)
);
```

#### Admin UI (`/admin/knowledge-base`)

```
┌────────────────────────────────────────────────────────────────┐
│  Knowledge Base Editor                           [+ Add Entry]  │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Categories          Entry Editor                               │
│  ┌───────────────┐  ┌────────────────────────────────────────┐ │
│  │ ▼ About       │  │ Category: [Teams ▼]                    │ │
│  │   Program     │  │ Title: [Team Levels                   ]│ │
│  │   Leadership  │  │                                        │ │
│  │   History     │  │ Content:                               │ │
│  │ ▼ Teams       │  │ ┌────────────────────────────────────┐ │ │
│  │   Levels  ←   │  │ │ TNE Prep - High school elite       │ │ │
│  │   Coaches     │  │ │ Elite Teams - 7th-8th grade        │ │ │
│  │ ▼ Schedule    │  │ │ Development - 3rd-6th grade        │ │ │
│  │ ▼ Fees        │  │ └────────────────────────────────────┘ │ │
│  │ ▼ Contact     │  │                                        │ │
│  └───────────────┘  │           [Preview] [Save Changes]     │ │
│                     └────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

#### How It Works
1. API fetches active knowledge base entries from Supabase
2. Constructs system prompt dynamically from entries
3. Admin changes take effect immediately (no deployment needed)

#### Effort: ~4-5 days

---

### Phase 4: Advanced Features

**Goal**: Match commercial solution capabilities

#### 4a. Human Escalation
- "Talk to a human" button in chat
- Creates support ticket in admin dashboard
- Email notification to staff
- Conversation context included

#### 4b. Proactive Engagement
- Trigger chat based on user behavior
- "Need help finding tryout info?" after 30s on tryouts page
- Configurable triggers per page

#### 4c. Multi-channel Support
- Same knowledge base powers:
  - Website chat (current)
  - Email auto-responses
  - SMS integration (Twilio)

#### 4d. Advanced Analytics
- Sentiment analysis on conversations
- Unanswered question detection
- Topic trend analysis over time
- Export reports to CSV/PDF

#### Effort: ~2-3 weeks total

---

## Comparison: Custom vs Zendesk

### Feature Comparison

| Feature | TNE Custom (Proposed) | Zendesk | Notes |
|---------|----------------------|---------|-------|
| AI Chatbot | ✅ Claude Haiku | ✅ Zendesk Bot | Custom uses more capable model |
| Knowledge Base | ✅ Phase 3 | ✅ | Both admin-editable |
| Conversation Logs | ✅ Phase 1 | ✅ | |
| Analytics | ✅ Phase 2 | ✅ | Zendesk more comprehensive |
| Feedback Collection | ✅ Phase 1 | ✅ | |
| Human Escalation | ✅ Phase 4 | ✅ | Zendesk has full ticketing |
| Multi-channel | ⚠️ Phase 4 | ✅ | Zendesk stronger here |
| Branding | ✅ Full control | ⚠️ Limited | Custom fits TNE perfectly |
| Customization | ✅ Unlimited | ⚠️ Template-based | |
| Self-hosted | ✅ Yes | ❌ No | Data stays with you |
| No vendor lock-in | ✅ Yes | ❌ No | |

### Cost Comparison

| Solution | Monthly Cost | Notes |
|----------|-------------|-------|
| **TNE Custom** | ~$5-20/mo | Claude API usage based |
| Zendesk Suite Team | $55/agent/mo | Minimum 1 agent |
| Zendesk Suite Growth | $89/agent/mo | Includes AI features |
| Zendesk Suite Professional | $115/agent/mo | Full analytics |
| Intercom | $74/seat/mo | Similar to Zendesk |
| Drift | $2,500/mo | Enterprise-focused |

### When to Choose Custom

✅ **Choose Custom (TNE) when:**
- Budget-conscious (youth sports organization)
- Want full brand control
- Simple support needs (FAQ, info lookup)
- Technical team available for maintenance
- Data privacy is important
- Integration with existing Supabase database

### When to Choose Zendesk

✅ **Choose Zendesk when:**
- Need full ticketing system
- Multiple support agents
- Complex workflow automation
- Phone/email/social support needed
- No technical team for maintenance
- Enterprise compliance requirements

---

## Recommended Implementation Path

### Immediate (This Week)
- **Phase 1**: Add feedback buttons + basic logging
- Gives you immediate visibility into user satisfaction

### Short-term (Next 2 Weeks)
- **Phase 2**: Build analytics dashboard
- Understand usage patterns before adding more features

### Medium-term (Next Month)
- **Phase 3**: Knowledge base management
- Empower non-technical staff to update AI

### Long-term (As Needed)
- **Phase 4**: Advanced features based on actual usage data
- Only build what users actually need

---

## Technical Considerations

### API Costs (Claude Haiku)

| Metric | Value |
|--------|-------|
| Input | $0.25 / 1M tokens |
| Output | $1.25 / 1M tokens |
| Avg conversation | ~2,000 tokens total |
| Cost per conversation | ~$0.002 |
| 1,000 conversations/mo | ~$2/month |

### Performance

| Metric | Current | With Logging |
|--------|---------|--------------|
| Response time | ~1-2s | ~1-2s (async logging) |
| Cold start | ~500ms | ~500ms |
| Storage | localStorage | Supabase (unlimited) |

### Security

- API key secured in Vercel env vars
- User messages validated (length, format)
- Rate limiting prevents abuse
- No PII stored without consent
- Session IDs are anonymous

---

## Next Steps

1. **Review this document** - Does this align with your vision?
2. **Prioritize phases** - Which features matter most?
3. **Create GitHub issues** - Track implementation work
4. **Start with Phase 1** - Quick win with high visibility

---

*Document created: December 25, 2025*
*Last updated: December 25, 2025*
