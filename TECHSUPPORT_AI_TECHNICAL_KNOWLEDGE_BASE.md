# TechSupport AI™ - Technical Knowledge Base

**Last Updated:** March 12, 2026  
**Version:** 1.0  
**Status:** Production  
**Invention Date:** December 15, 2025 (America/New_York)  
**Audience:** Internal team + Technical documentation

---

## Table of Contents

1. [Product Overview](#product-overview)
2. [System Architecture](#system-architecture)
3. [Level 1 - TechSupport AI™](#level-1---techsupport-ai)
4. [Level 2 - TechSupport AI-2™](#level-2---techsupport-ai-2)
5. [VisionScreen™ Technology](#visionscreen-technology)
6. [Multilingual Support](#multilingual-support)
7. [Technical Stack](#technical-stack)
8. [Data Architecture](#data-architecture)
9. [Twilio Integration](#twilio-integration)
10. [Call Flow & Session Management](#call-flow--session-management)
11. [Troubleshooting Playbooks](#troubleshooting-playbooks)
12. [Security & Compliance](#security--compliance)
13. [Analytics & Monitoring](#analytics--monitoring)
14. [Deployment & Operations](#deployment--operations)
15. [API Reference](#api-reference)
16. [Integration with NOFA AI Factory](#integration-with-nofa-ai-factory)
17. [Best Practices](#best-practices)
18. [Troubleshooting Guide](#troubleshooting-guide)

---

## Product Overview

### What is TechSupport AI™?

TechSupport AI™ is a **voice-first, multi-language, multi-tiered AI help desk agent** designed for SaaS companies and AI factories. It provides automated technical support through phone calls, combining natural language processing, automated troubleshooting, and visual guidance.

The system operates on two levels:
- **Level 1 (TechSupport AI™)**: Fast triage and resolution for 60-80% of common issues
- **Level 2 (TechSupport AI-2™)**: Deep troubleshooting with VisionScreen™ visual guidance for complex cases

### Core Value Proposition

**For Businesses:**
- Reduce support costs by automating 60-80% of common technical issues
- Provide 24/7 multilingual technical support
- Scale support operations without proportional headcount increases
- Capture complete case documentation automatically
- Reduce average handle time (AHT)
- Improve first-call resolution (FCR) rates

**For Customers:**
- Instant technical support via phone call
- Multilingual support (6 languages at launch)
- Visual guidance for complex issues (VisionScreen™)
- No account creation or app download required
- SMS and email follow-ups with resolution steps
- Seamless escalation to human agents when needed

### Key Differentiators

1. **Voice-First Design**: Accessible via phone call, no app required
2. **Two-Tier Architecture**: Fast L1 triage + deep L2 troubleshooting
3. **VisionScreen™**: Visual guidance via screen share or camera
4. **Multilingual**: 6 languages with auto-detection
5. **Complete Documentation**: Automated case file creation in Firestore
6. **NOFA AI Factory Integration**: Works with CommandDesk AI™, CareerPilot AI™, etc.

### Company Information

- **Developer**: NOFA Business Consulting LLC
- **Platform**: NOFA AI Factory™
- **Product**: TechSupport AI™ (L1) + TechSupport AI-2™ (L2)
- **Support Component**: VisionScreen™
- **Support Email**: techsupport-ai@nofabusinessconsulting.com
- **General Support**: supportdesk@nofabusinessconsult ing.com
- **Location**: United States

---

## System Architecture

### High-Level Architecture

```
Customer Phone Call → Twilio Voice → Level 1 AI (Triage)
                                            ↓
                                     Classification
                                            ↓
                                ┌───────────┴───────────┐
                                ↓                       ↓
                        [Easy Issue]              [Complex Issue]
                                ↓                       ↓
                        Playbook Run              Level 2 AI
                                ↓                       ↓
                        Resolution               VisionScreen™
                                ↓                       ↓
                        SMS/Email              Screen Share/Camera
                                ↓                       ↓
                                └─────→ Firestore ←────┘
                                            ↓
                                    [Escalation Packet]
                                            ↓
                                    Human Agent (if needed)
```

### Technology Stack

**Frontend:**
- Next.js 14.2.5
- React 18.2.0
- TypeScript 5.4.5
- Tailwind CSS 3.4.4
- Radix UI components
- Zustand (state management)
- TanStack React Query
- next-intl (internationalization)

**Backend:**
- Next.js API Routes (serverless)
- Node.js 20+
- Firebase Admin SDK
- OpenAI API (GPT-4 for L1, GPT-4 Turbo for L2)
- Twilio Voice API
- Twilio SMS API
- Pinecone (vector database for knowledge retrieval)

**Database & Storage:**
- Firebase Firestore (NoSQL)
- Firebase Auth (authentication)
- Pinecone (vector embeddings)

**Communication:**
- Twilio Voice (phone calls)
- Twilio SMS (session links, updates)
- Resend (email notifications)

**Deployment:**
- Vercel (hosting + serverless)
- GitHub (version control + CI/CD)

### System Components

#### 1. Call Handler (Twilio Webhook)
- Receives incoming calls
- Initiates session
- Routes to Level 1

#### 2. Level 1 AI Engine
- Language detection
- Issue classification
- Playbook execution
- Decision: resolve or escalate

#### 3. Level 2 AI Engine
- Context inheritance from L1
- VisionScreen™ activation
- Deep troubleshooting
- Visual guidance

#### 4. VisionScreen™ Interface
- WebRTC screen sharing
- Camera fallback mode
- Real-time guidance
- Session recording (optional)

#### 5. Session Manager
- Session lifecycle
- State persistence
- Timeline tracking
- Artifact storage

#### 6. Knowledge Base
- Pinecone vector search
- Product documentation
- Troubleshooting guides
- Common solutions

#### 7. Notification Service
- SMS delivery (Twilio)
- Email delivery (Resend)
- Follow-up scheduling
- Escalation alerts

---

## Level 1 - TechSupport AI™

### Purpose

**Goal:** Resolve 60-80% of common technical issues quickly and cost-effectively through automated playbook execution.

### Capabilities

**1. Language Detection & Confirmation**
- Auto-detect caller's language from initial speech
- Confirm detected language ("I detected you're speaking English. Is that correct?")
- Lock language for entire session
- Store language preference in Firestore

**Supported Languages:**
- English (en-US)
- French (fr-FR)
- German (de-DE)
- Italian (it-IT)
- Chinese/Mandarin (zh-CN)
- Farsi/Persian (fa-IR)

**2. Issue Classification**
- Analyzes caller's problem description
- Classifies into predefined categories:
  - Login/Authentication
  - Billing/Subscription
  - API Keys/Integration
  - Data Upload/Import
  - Performance/Speed
  - Affiliate Tracking
  - Feature Access
  - Error Messages
  - Account Settings
  - General Inquiry

**3. Intake Questions**
- Account/workspace ID
- Product version
- Error message text
- Last action before issue
- Browser/platform (if relevant)
- Timeframe (when did issue start)

**4. Playbook Execution**
- Runs scripted troubleshooting steps
- Guides user through resolution
- Validates each step completion
- Adapts based on user responses

**5. Case Documentation**
- Records all conversation details
- Logs troubleshooting steps attempted
- Stores outcomes and validations
- Creates timeline of events
- Saves sanitized artifacts

**6. Follow-up Communication**
- Sends SMS recap with resolution steps
- Sends email with detailed documentation
- Includes reference case ID
- Provides escalation contact if needed

### Technical Flow

```
1. Call Received → Twilio Webhook → /api/voice/incoming
2. Create Session → Firestore sessions/{sessionId}
3. Greet Caller → Detect Language → Confirm
4. Ask for Problem → OpenAI Classification
5. Run Intake Questions → Store Responses
6. Execute Playbook → Track Steps
7. Decision:
   - Resolved → Send SMS/Email → End Call
   - Unresolved → Escalate to Level 2
8. Update Firestore → Close Session
```

### Playbook Structure

**Example: Login Issue Playbook**

```json
{
  "playbookId": "login-001",
  "category": "login_authentication",
  "title": "Login Troubleshooting",
  "steps": [
    {
      "stepId": 1,
      "instruction": "Verify email address is correct",
      "validation": "Ask user to spell email",
      "failureAction": "escalate"
    },
    {
      "stepId": 2,
      "instruction": "Attempt password reset",
      "action": "Send password reset link",
      "validation": "User confirms email received",
      "failureAction": "continue"
    },
    {
      "stepId": 3,
      "instruction": "Check for account lock",
      "query": "Firestore users/{userId}/status",
      "resolution": "Unlock if locked",
      "failureAction": "escalate"
    },
    {
      "stepId": 4,
      "instruction": "Clear browser cache and cookies",
      "guidance": "Step-by-step cache clearing",
      "validation": "User attempts login",
      "successAction": "resolve",
      "failureAction": "escalate"
    }
  ],
  "estimatedDuration": 5,
  "escalationThreshold": 2
}
```

### Resolution Criteria

**Successful Resolution:**
- User confirms issue is resolved
- All playbook steps completed
- Validation checks passed
- User satisfaction confirmed

**Escalation Triggers:**
- Issue not in playbook database
- Playbook steps fail validation
- User requests human agent
- Time exceeds threshold (10 minutes)
- Critical severity detected
- System access required

### Performance Metrics

**Key Performance Indicators (KPIs):**
- **First Call Resolution (FCR)**: Target 65%
- **Average Handle Time (AHT)**: Target 6 minutes
- **Escalation Rate**: Target <35%
- **User Satisfaction**: Target >4.2/5
- **Language Detection Accuracy**: Target >95%
- **Classification Accuracy**: Target >90%

---

## Level 2 - TechSupport AI-2™

### Purpose

**Goal:** Solve complex technical issues using VisionScreen™ visual guidance and deeper troubleshooting capabilities.

### When Level 2 Activates

**Escalation from Level 1:**
- Playbook exhausted without resolution
- User explicitly requests escalation
- Critical severity detected
- System-level diagnosis required
- Multi-step configuration needed

**Direct Entry:**
- User calls back with escalation code
- Human agent requests AI assistance
- Complex issue identified upfront

### Enhanced Capabilities

**1. Context Inheritance**
- Receives complete L1 case file
- No repeated questions
- Continues from last L1 step
- Understands full history

**2. VisionScreen™ Activation**
- Generates secure session link
- Sends SMS to user's phone
- Waits for connection
- Initiates visual guidance

**3. Advanced Diagnostics**
- System health checks
- Log file analysis
- Configuration validation
- API connectivity tests
- Database query inspection

**4. Visual Guidance**
- Screen share analysis
- Real-time annotations
- Step-by-step navigation
- Error detection
- Progress validation

**5. Permissioned Actions**
- Account configuration changes
- Feature flag toggles
- Cache clearing
- System resets
- Temporary access grants

**6. Escalation Packet Generation**
- Complete case documentation
- Screenshots/recordings
- Diagnostic results
- Attempted solutions
- Recommended next steps

### VisionScreen™ Integration

**Session Initiation:**
1. L2 AI generates unique session URL
2. SMS sent to user: "Click to connect: https://vision.techsupport-ai.com/session/{id}"
3. User clicks link on phone
4. Requests screen share or camera permission
5. Stream connects to L2 AI
6. Visual guidance begins

**Modes:**
- **Screen Share (Preferred)**: User shares device screen
- **Camera Mode (Fallback)**: User points camera at computer screen

### Advanced Playbooks

**Example: API Integration Issue**

```json
{
  "playbookId": "api-integration-002",
  "level": 2,
  "requiresVisionScreen": true,
  "steps": [
    {
      "stepId": 1,
      "instruction": "Verify API key format",
      "visionGuidance": "Navigate to Settings → API Keys",
      "validation": "Check key format matches pattern",
      "diagnostics": "Test API key validity"
    },
    {
      "stepId": 2,
      "instruction": "Check API endpoint configuration",
      "visionGuidance": "Show Integration Settings",
      "validation": "Verify endpoint URL",
      "correction": "Update if incorrect"
    },
    {
      "stepId": 3,
      "instruction": "Test API connection",
      "action": "Run connection test",
      "visionGuidance": "Show results panel",
      "interpretation": "Explain error codes"
    },
    {
      "stepId": 4,
      "instruction": "Review request/response logs",
      "visionGuidance": "Navigate to Logs",
      "analysis": "Identify failure point",
      "resolution": "Apply fix or escalate"
    }
  ]
}
```

### Human Escalation

**When to Escalate to Human:**
- L2 playbooks exhausted
- Requires code changes
- Billing/refund issues
- Account security concerns
- Legal/compliance matters
- User explicitly demands human

**Escalation Packet Contents:**
- **Session Details**: ID, duration, language
- **User Information**: Account ID, product, plan
- **Issue Summary**: Classification, severity, history
- **Timeline**: All events and attempted solutions
- **Diagnostics**: System checks, logs, screenshots
- **AI Recommendation**: Suggested resolution path
- **Priority**: Low, Medium, High, Critical
- **Next Steps**: Recommended actions for human agent

---

## VisionScreen™ Technology

### Overview

VisionScreen™ is a proprietary visual support technology that enables AI agents to "see" what users see and guide them through technical issues visually.

**Key Design Principle:** VisionScreen™ is exclusive to Level 2 to keep L1 fast, scalable, and cost-effective.

### Technical Architecture

**Components:**

1. **Session Manager**
   - Generates unique session IDs
   - Creates secure time-limited URLs
   - Manages WebRTC connections
   - Handles fallback modes

2. **WebRTC Peer Connection**
   - Direct browser-to-server streaming
   - Screen capture API integration
   - Camera stream fallback
   - Low-latency transmission (<500ms)

3. **AI Vision Processing**
   - Frame analysis (OpenAI Vision API)
   - UI element detection
   - Error message recognition
   - Progress validation
   - Screenshot capture

4. **Guidance Overlay**
   - Real-time annotations
   - Highlight regions
   - Arrow indicators
   - Text instructions
   - Progress indicators

### Screen Share Mode

**Preferred Method:**

**Requirements:**
- Modern browser (Chrome, Firefox, Edge, Safari)
- Screen sharing permission granted
- Stable internet connection (>1 Mbps)

**Process:**
1. User clicks SMS link on mobile device
2. Browser requests screen share permission
3. User selects screen/window/tab to share
4. Stream connects to VisionScreen™ server
5. AI analyzes frames in real-time
6. Provides visual + voice guidance

**Capabilities:**
- See exact user interface
- Detect errors/warnings
- Identify misconfigurations
- Guide mouse movements
- Validate completed steps

### Camera Mode

**Fallback Method:**

**Use Cases:**
- Screen share not supported/available
- Permission denied
- Browser compatibility issues
- Mobile-to-desktop support

**Process:**
1. User clicks SMS link
2. Browser requests camera permission
3. User points phone camera at computer screen
4. AI processes camera feed
5. Adjusts for angle/lighting
6. Provides guidance

**Limitations:**
- Lower resolution
- Requires stable hand/mount
- Lighting dependent
- Text may be harder to read

**Optimization:**
- AI requests adjustments ("Move closer", "Better lighting")
- Frame enhancement algorithms
- Text recognition (OCR)
- Error pattern matching

### Privacy & Security

**Data Protection:**
- End-to-end encrypted streams (DTLS/SRTP)
- Session URLs expire after 60 minutes
- One-time use session IDs
- No permanent recording without consent
- PII detection and redaction

**User Control:**
- Explicit permission required
- Can end session anytime
- Screen/window selection control
- Visual indicator when streaming
- Option to pause/resume

**Compliance:**
- GDPR compliant
- HIPAA compatible architecture (healthcare clients)
- SOC 2 Type II certified infrastructure
- Data residency options

### Performance

**Latency Targets:**
- Stream initiation: <5 seconds
- Frame processing: <200ms
- AI response: <2 seconds
- End-to-end: <3 seconds

**Bandwidth:**
- Screen share: 0.5-2 Mbps
- Camera mode: 0.3-1 Mbps
- Adaptive bitrate based on connection

**Reliability:**
- Automatic reconnection
- Quality degradation gracefully
- Fallback to camera mode
- Fallback to voice-only if needed

---

## Multilingual Support

### Supported Languages

**Launch Languages (6 Total):**

| Language | Code | Native Name | Script | RTL | Voice Support |
|----------|------|-------------|--------|-----|---------------|
| English | en-US | English | Latin | No | ✅ |
| French | fr-FR | Français | Latin | No | ✅ |
| German | de-DE | Deutsch | Latin | No | ✅ |
| Italian | it-IT | Italiano | Latin | No | ✅ |
| Chinese (Mandarin) | zh-CN | 中文 | Simplified | No | ✅ |
| Farsi (Persian) | fa-IR | فارسی | Persian | Yes | ✅ |

### Language Detection

**Auto-Detection Process:**

1. **Initial Speech Analysis** (first 3-5 seconds)
   - OpenAI Whisper transcribes initial utterance
   - Detects language with confidence score
   - Requires >90% confidence to proceed

2. **Confirmation** (if confident)
   - AI asks in detected language: "I detected you're speaking [language]. Is that correct?"
   - User confirms yes/no
   - If yes → lock language, proceed
   - If no → ask for preferred language

3. **Manual Selection** (if low confidence)
   - AI asks in English: "What language would you like to use?"
   - Lists options in each language
   - User selects
   - Lock and proceed

4. **Language Lock**
   - Store in Firestore: `sessions/{sessionId}/language`
   - All subsequent responses in locked language
   - Cannot change mid-session (prevents confusion)
   - Noted in escalation packet

### Translation Architecture

**Components:**

1. **Prompt Templates**
   - Separate template per language
   - Native speaker reviewed
   - Cultural adaptation (not literal translation)
   - Stored in `prompts/{lang}/`

2. **Response Generation**
   - OpenAI generates response in user's language
   - Context includes language instruction
   - System prompt: "You must respond only in {language}"

3. **SMS/Email Templates**
   - Pre-translated templates
   - Dynamic variable injection
   - RTL formatting for Farsi
   - Character encoding validation

4. **UI Localization**
   - next-intl for React components
   - Separate translation files
   - RTL stylesheet for Farsi
   - Font selection per language

### RTL (Right-to-Left) Support

**Farsi-Specific Considerations:**

**UI Layout:**
```css
[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

[dir="rtl"] .flex-row {
  flex-direction: row-reverse;
}

[dir="rtl"] .timeline::before {
  right: 0;
  left: auto;
}
```

**Text Rendering:**
- Use Unicode bidirectional algorithm
- Proper number formatting (۱۲۳ vs 123)
- Date formatting (1403/12/21 vs 2026-03-12)
- Time formatting (۱۴:۳۰ vs 14:30)

**Testing:**
- Native Farsi speaker QA
- Visual regression tests
- Text overflow checks
- Mixed LTR/RTL content handling

### Voice Synthesis

**Text-to-Speech (TTS):**
- OpenAI TTS API
- Language-specific voices
- Natural prosody
- Emotion adaptation

**Voice Quality:**
- Sample rate: 24kHz
- Bitrate: 64 kbps
- Format: Opus codec
- Latency: <500ms

---

## Technical Stack

### Frontend Technologies

**Framework:**
- Next.js 14.2.5 (App Router)
- React 18.2.0
- TypeScript 5.4.5

**UI Libraries:**
- Tailwind CSS 3.4.4
- Radix UI (accessible components)
- Lucide React (icons)
- class-variance-authority (CVA)
- tailwind-merge

**State Management:**
- Zustand 4.5.2 (global state)
- TanStack React Query (server state)

**Internationalization:**
- next-intl 3.15.0
- RTL support
- Dynamic locale switching

### Backend Technologies

**Runtime:**
- Node.js 20+
- Next.js API Routes (serverless)

**AI/ML:**
- OpenAI API 6.22.0
  - GPT-4 (Level 1)
  - GPT-4 Turbo (Level 2)
  - Whisper (speech-to-text)
  - TTS (text-to-speech)
  - Vision API (VisionScreen™)

**Vector Database:**
- Pinecone 7.0.0
- Vector embeddings for KB search
- Semantic similarity matching

**Communication:**
- Twilio 5.12.1
  - Voice API
  - SMS API
  - Programmable Voice
- Resend 6.9.2 (email)

**Database:**
- Firebase 10.12.0 (client SDK)
- Firebase Admin 12.1.0 (server SDK)
- Firestore (NoSQL document database)

### Infrastructure

**Hosting:**
- Vercel (Next.js deployment)
- Serverless functions
- Edge network
- Automatic scaling

**CDN:**
- Vercel Edge Network
- Global distribution
- Low latency (<100ms)

**Media Streaming:**
- WebRTC (peer-to-peer when possible)
- TURN/STUN servers
- Media recording storage

### Development Tools

**Package Manager:**
- npm (Node Package Manager)

**Linting:**
- ESLint 8.57.0
- eslint-config-next

**Type Checking:**
- TypeScript strict mode
- Type generation from API

**Build Tools:**
- PostCSS 8.4.38
- Autoprefixer 10.4.19

---

## Data Architecture

### Firestore Schema

#### Collections Structure

```
firestore/
├── sessions/
│   ├── {sessionId}/
│   │   ├── sessionId: string
│   │   ├── callerPhone: string (hashed)
│   │   ├── language: string
│   │   ├── level: 1 | 2
│   │   ├── startTime: timestamp
│   │   ├── endTime: timestamp | null
│   │   ├── duration: number (seconds)
│   │   ├── status: "active" | "resolved" | "escalated" | "abandoned"
│   │   ├── product: string
│   │   ├── accountId: string (if provided)
│   │   └── metadata: object
│   │
├── cases/
│   ├── {caseId}/
│   │   ├── caseId: string
│   │   ├── sessionId: string (reference)
│   │   ├── category: string
│   │   ├── severity: "low" | "medium" | "high" | "critical"
│   │   ├── title: string
│   │   ├── description: string
│   │   ├── resolution: string | null
│   │   ├── resolutionTime: number | null (minutes)
│   │   ├── escalated: boolean
│   │   ├── escalationReason: string | null
│   │   └── satisfaction: number | null (1-5)
│   │
├── timeline/
│   ├── {sessionId}/
│   │   └── events/ (subcollection)
│   │       ├── {eventId}/
│   │       │   ├── eventId: string
│   │       │   ├── timestamp: timestamp
│   │       │   ├── type: string
│   │       │   ├── actor: "ai" | "user" | "system"
│   │       │   ├── action: string
│   │       │   ├── details: object
│   │       │   └── outcome: string | null
│   │
├── playbooks/
│   ├── {playbookId}/
│   │   ├── playbookId: string
│   │   ├── category: string
│   │   ├── level: 1 | 2
│   │   ├── title: string
│   │   ├── steps: array
│   │   ├── estimatedDuration: number
│   │   ├── successRate: number
│   │   ├── lastUpdated: timestamp
│   │   └── active: boolean
│   │
├── artifacts/
│   ├── {sessionId}/
│   │   └── files/ (subcollection)
│   │       ├── {fileId}/
│   │       │   ├── fileId: string
│   │       │   ├── type: "screenshot" | "log" | "recording"
│   │       │   ├── url: string (Firebase Storage)
│   │       │   ├── size: number (bytes)
│   │       │   ├── timestamp: timestamp
│   │       │   └── description: string
│   │
└── analytics/
    └── daily/
        ├── {date}/
        │   ├── totalCalls: number
        │   ├── level1Resolutions: number
        │   ├── level2Escalations: number
        │   ├── humanEscalations: number
        │   ├── averageHandleTime: number
        │   ├── languageDistribution: object
        │   ├── categoryDistribution: object
        │   └── satisfactionAverage: number
```

### Data Retention

**Active Sessions:**
- Retention: 90 days
- Full detail preserved
- Searchable and reportable

**Archived Sessions:**
- Retention: 7 years (compliance)
- Compressed storage
- Limited searchability
- Export available on request

**Artifacts (Screenshots/Recordings):**
- Retention: 30 days (default)
- 90 days for escalated cases
- Encrypted at rest
- Automatic deletion after expiration

**Analytics:**
- Daily aggregates: Indefinite
- Raw events: 90 days
- Historical trends: Summarized monthly

### Data Privacy

**PII Handling:**
- Phone numbers hashed (SHA-256)
- Email addresses encrypted
- Account IDs tokenized
- Names redacted from transcripts
- Payment info never stored

**GDPR Compliance:**
- Right to access: Export API available
- Right to erasure: Delete endpoint
- Data portability: JSON export
- Consent management: Opt-in required

**Security:**
- Firestore security rules
- Field-level encryption
- Audit logging
- Access control (RBAC)

---

## Twilio Integration

### Voice API Configuration

**Incoming Call Webhook:**

**URL:** `https://techsupport-ai.com/api/voice/incoming`

**Method:** POST

**Request Payload:**
```json
{
  "CallSid": "CA1234567890abcdef",
  "AccountSid": "AC1234567890abcdef",
  "From": "+15555551234",
  "To": "+15555559999",
  "CallStatus": "ringing",
  "Direction": "inbound",
  "ApiVersion": "2010-04-01",
  "ForwardedFrom": null,
  "CallerName": null
}
```

**Response (TwiML):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna" language="en-US">
    Welcome to TechSupport AI. Please tell me about your issue in your preferred language.
  </Say>
  <Gather input="speech" timeout="10" language="auto" action="/api/voice/process">
    <Say>You can start speaking now.</Say>
  </Gather>
</Response>
```

### SMS Configuration

**Sending SMS:**

```javascript
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

await client.messages.create({
  from: process.env.TWILIO_PHONE_NUMBER,
  to: userPhone,
  body: `Your TechSupport AI session: ${resolutionSteps}\n\nCase ID: ${caseId}\n\nQuestions? Reply to this message.`
});
```

**VisionScreen™ Link SMS:**

```javascript
const visionScreenUrl = `https://vision.techsupport-ai.com/session/${sessionId}?auth=${authToken}`;

await client.messages.create({
  from: process.env.TWILIO_PHONE_NUMBER,
  to: userPhone,
  body: `Click to connect visual support: ${visionScreenUrl}\n\nThis link expires in 60 minutes.`
});
```

### Call Recording

**Configuration:**
- Recording: Optional (consent required)
- Format: MP3
- Channels: Dual (separate tracks for caller/AI)
- Transcription: Automatic via Whisper API
- Storage: Firebase Storage
- Retention: 30 days

**TwiML for Recording:**
```xml
<Response>
  <Say>This call may be recorded for quality assurance.</Say>
  <Record action="/api/voice/recording-complete" transcribe="true" maxLength="1800" />
</Response>
```

### WebRTC Integration

**Twilio Programmable Voice:**
- Real-time bidirectional audio
- WebSocket connection
- Low latency (<300ms)
- Codec: Opus
- Sample rate: 8kHz (narrowband) or 16kHz (wideband)

---

## Call Flow & Session Management

### Level 1 Call Flow

```
1. [INCOMING CALL]
   ↓
2. [GREETING] "Welcome to TechSupport AI"
   ↓
3. [LANGUAGE DETECTION]
   - User speaks
   - AI detects language
   - Confirms with user
   - Lock language
   ↓
4. [PROBLEM INTAKE]
   "Please describe your issue"
   - User explains problem
   - AI transcribes and classifies
   ↓
5. [CLASSIFICATION]
   - Category identified
   - Severity assessed
   - Playbook selected
   ↓
6. [INTAKE QUESTIONS]
   - Account ID?
   - Product version?
   - Error message?
   - When did it start?
   ↓
7. [PLAYBOOK EXECUTION]
   For each step:
     - AI guides user
     - User performs action
     - AI validates outcome
     - Log to timeline
   ↓
8. [DECISION POINT]
   ├─> [RESOLVED]
   │   - Confirm resolution
   │   - Rate satisfaction
   │   - Send SMS/email
   │   - Thank and end call
   │   - Status: "resolved"
   │
   └─> [NOT RESOLVED]
       - Explain escalation
       - Transfer to Level 2
       - Status: "escalated"
```

### Level 2 Call Flow

```
1. [CONTEXT INHERITANCE]
   - Load L1 case file
   - Review attempts
   - Identify next steps
   ↓
2. [L2 GREETING]
   "I have your complete case history. Let's continue where we left off."
   ↓
3. [VISION SCREEN OFFER]
   "For faster resolution, I can guide you visually. May I send you a link?"
   ├─> [YES] → Send SMS → Wait for connection → Continue with VisionScreen
   └─> [NO] → Continue voice-only
   ↓
4. [ADVANCED DIAGNOSTICS]
   - Run system checks
   - Analyze logs
   - Test configurations
   - Visual inspection (if VisionScreen active)
   ↓
5. [DEEP TROUBLESHOOTING]
   - Advanced playbook execution
   - Configuration changes (if permitted)
   - Multi-step procedures
   - Real-time validation
   ↓
6. [DECISION POINT]
   ├─> [RESOLVED]
   │   - Confirm resolution
   │   - Document solution
   │   - Send comprehensive recap
   │   - Rate satisfaction
   │   - Status: "resolved"
   │
   └─> [ESCALATE TO HUMAN]
       - Generate escalation packet
       - Explain next steps
       - Provide case ID
       - Set expectations
       - Status: "escalated_human"
```

### Session State Machine

**States:**

1. **initiated**: Call connected, session created
2. **language_detected**: Language identified and locked
3. **classified**: Issue categorized, playbook selected
4. **troubleshooting_l1**: Level 1 playbook in progress
5. **escalated_l2**: Transferred to Level 2
6. **visionscreen_active**: Visual guidance in progress
7. **resolved**: Issue successfully resolved
8. **escalated_human**: Transferred to human agent
9. **abandoned**: User hung up before resolution
10. **completed**: Session closed, artifacts saved

**Transitions:**
- Each state transition logged to timeline
- State stored in Firestore `sessions/{sessionId}/state`
- State determines available actions
- Invalid transitions rejected

### Session Timeout Handling

**Timeouts:**

- **Level 1**: 15 minutes max
- **Level 2**: 30 minutes max
- **VisionScreen™ idle**: 5 minutes (reconnect prompt)
- **Total session**: 45 minutes absolute max

**Timeout Actions:**
- Warning at 80% of limit
- Graceful wrap-up at 90%
- Force close at 100%
- Save partial progress
- Send incomplete case summary
- Mark status: "timeout"

---

## Troubleshooting Playbooks

### Playbook Categories

1. **Authentication & Login**
   - Password reset
   - Account locked
   - MFA issues
   - Email verification
   - Session timeout

2. **Billing & Subscription**
   - Payment failed
   - Subscription not active
   - Plan upgrade issues
   - Invoice questions
   - Credit card declined

3. **API & Integrations**
   - API key invalid
   - Endpoint unreachable
   - Authentication errors
   - Rate limit exceeded
   - Webhook failures

4. **Data & Uploads**
   - File upload failed
   - Import errors
   - Data not syncing
   - Export issues
   - File format problems

5. **Performance & Errors**
   - Slow loading
   - Timeout errors
   - 500 errors
   - Database connection issues
   - Memory/resource errors

6. **Feature Access**
   - Feature not available
   - Permission denied
   - Plan limitations
   - Beta access issues
   - Feature flag problems

### Playbook Template

```json
{
  "playbookId": "auth-001-password-reset",
  "version": "1.2",
  "level": 1,
  "category": "authentication",
  "title": "Password Reset Assistance",
  "description": "Guide user through password reset process",
  "estimatedDuration": 5,
  "prerequisites": ["user_has_email_access"],
  "steps": [
    {
      "stepId": 1,
      "type": "verification",
      "instruction": "Verify user email address",
      "aiGuidance": "Ask user to spell email slowly, confirm each part",
      "validation": {
        "type": "email_format",
        "regex": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
      },
      "successAction": "next",
      "failureAction": "retry_max_3"
    },
    {
      "stepId": 2,
      "type": "system_action",
      "instruction": "Send password reset email",
      "apiCall": {
        "endpoint": "/api/auth/password-reset",
        "method": "POST",
        "payload": {"email": "{email}"}
      },
      "userGuidance": "I've sent a password reset link to {email}. Please check your inbox and spam folder.",
      "timeout": 30,
      "successAction": "next",
      "failureAction": "escalate"
    },
    {
      "stepId": 3,
      "type": "user_action",
      "instruction": "User clicks reset link in email",
      "aiGuidance": "Ask user to check email and click the link. Wait for confirmation.",
      "maxWaitTime": 120,
      "validation": {
        "type": "user_confirmation",
        "question": "Have you received and clicked the reset link?"
      },
      "successAction": "next",
      "failureAction": "step_2_retry"
    },
    {
      "stepId": 4,
      "type": "user_action",
      "instruction": "User creates new password",
      "aiGuidance": "Guide user through password requirements",
      "requirements": [
        "Minimum 8 characters",
        "At least one uppercase letter",
        "At least one number",
        "At least one special character"
      ],
      "validation": {
        "type": "user_confirmation",
        "question": "Were you able to set a new password successfully?"
      },
      "successAction": "next",
      "failureAction": "troubleshoot_password"
    },
    {
      "stepId": 5,
      "type": "verification",
      "instruction": "Verify login with new password",
      "aiGuidance": "Ask user to try logging in with new password",
      "validation": {
        "type": "user_confirmation",
        "question": "Can you log in now?"
      },
      "successAction": "resolve",
      "failureAction": "escalate"
    }
  ],
  "resolution": {
    "successMessage": "Great! Your password has been reset and you're logged in. Is there anything else I can help you with?",
    "smsRecap": "Password reset completed. You can now log in with your new password. Case ID: {caseId}",
    "emailSubject": "Password Reset - Case {caseId}",
    "emailBody": "Your password has been successfully reset. If you didn't request this, please contact security@company.com immediately."
  },
  "escalation": {
    "reasons": [
      "Email not in system",
      "Reset link expired repeatedly",
      "Account locked by security",
      "User cannot access email"
    ],
    "humanRequired": true,
    "priority": "medium"
  },
  "metadata": {
    "successRate": 0.87,
    "averageDuration": 4.5,
    "lastUpdated": "2026-03-01",
    "author": "TechSupport AI Team"
  }
}
```

### Playbook Management

**Storage:** Firestore `playbooks/{playbookId}`

**Versioning:**
- Semantic versioning (1.0, 1.1, 2.0)
- Version history maintained
- Rollback capability
- A/B testing support

**Performance Tracking:**
- Success rate per playbook
- Average completion time
- Escalation frequency
- User satisfaction scores
- Failure point analysis

**Continuous Improvement:**
- Weekly review of failure patterns
- Monthly playbook updates
- Seasonal adjustments
- Product update synchronization

---

## Security & Compliance

### Data Encryption

**In Transit:**
- TLS 1.3 for all HTTPS connections
- DTLS/SRTP for WebRTC streams
- End-to-end encryption for sensitive data
- Certificate pinning

**At Rest:**
- AES-256 encryption (Firestore)
- Encrypted Firebase Storage buckets
- Key rotation (90 days)
- Hardware Security Modules (HSM) for key storage

### Authentication & Authorization

**User Authentication:**
- Session-based (no persistent accounts for callers)
- Phone number verification (optional)
- Time-limited session tokens
- Device fingerprinting

**Agent Authentication:**
- Firebase Auth for admin panel
- Multi-factor authentication (MFA) required
- Role-based access control (RBAC)
- Session expiration (24 hours)

**API Authentication:**
- Bearer tokens for API access
- API key rotation policy
- Rate limiting per client
- IP whitelisting (optional)

### Privacy & Compliance

**GDPR Compliance:**
- Data processing agreements
- Right to access
- Right to erasure
- Right to portability
- Consent management
- Data protection officer assigned

**HIPAA Compliance** (for healthcare clients):
- Business Associate Agreement (BAA)
- Encrypted PHI storage
- Audit logging
- Access controls
- Breach notification procedures

**CCPA Compliance:**
- Privacy policy disclosure
- Opt-out mechanisms
- Data sale prohibition
- Consumer rights fulfillment

**PCI DSS** (if handling payments):
- No card data storage
- Tokenization via Stripe
- Secure transmission
- Regular security audits

### Call Recording Consent

**Consent Flow:**
1. Pre-call recording notice (IVR)
2. Explicit consent request
3. Option to decline (recording disabled)
4. Consent logged to Firestore
5. Recording marked with consent status

**Regulations:**
- One-party consent states: Automatic
- Two-party consent states: Required
- International: Follow local laws
- Disclosure in privacy policy

### Vulnerability Management

**Security Practices:**
- Dependency scanning (npm audit)
- OWASP Top 10 mitigation
- Regular penetration testing
- Bug bounty program
- Incident response plan

**Monitoring:**
- Intrusion detection system (IDS)
- Anomaly detection
- Failed authentication alerts
- Unusual traffic patterns
- Data exfiltration monitoring

---

## Analytics & Monitoring

### Key Performance Indicators

**Operational Metrics:**
- Total calls per day/week/month
- Average handle time (AHT)
- First call resolution (FCR) rate
- Level 1 resolution rate (target: 65%)
- Level 2 escalation rate (target: 30%)
- Human escalation rate (target: 5%)
- Call abandonment rate (target: <10%)

**Quality Metrics:**
- Customer satisfaction score (CSAT)
- Net Promoter Score (NPS)
- Classification accuracy
- Language detection accuracy
- Playbook success rate
- VisionScreen™ connection success rate

**Technical Metrics:**
- API response time
- WebRTC latency
- System uptime (target: 99.9%)
- Error rate (target: <1%)
- Firestore query time
- OpenAI API latency

### Dashboard

**Real-Time Dashboard:**
- Active calls counter
- Current queue depth
- System health status
- Error alerts
- Average wait time
- Agent utilization

**Analytics Dashboard:**
- Daily/weekly/monthly trends
- Category distribution pie chart
- Language distribution
- Resolution funnel
- Escalation reasons
- Satisfaction trends

### Logging

**Application Logs:**
- Info: Normal operations
- Warning: Potential issues
- Error: Failed operations
- Critical: System failures

**Audit Logs:**
- User actions
- System changes
- Configuration updates
- Access attempts
- Data exports

**Call Logs:**
- Full conversation transcripts
- AI responses
- User inputs
- System actions
- Validation results

### Alerting

**Alert Channels:**
- Slack webhooks
- Email notifications
- SMS (critical only)
- PagerDuty integration

**Alert Types:**
- **P1 (Critical)**: System down, data breach
- **P2 (High)**: High error rate, API failures
- **P3 (Medium)**: Escalation spike, low CSAT
- **P4 (Low)**: Playbook underperforming, minor bugs

---

## Deployment & Operations

### Vercel Deployment

**Configuration:**

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "env": {
    "OPENAI_API_KEY": "@openai-key",
    "TWILIO_ACCOUNT_SID": "@twilio-sid",
    "TWILIO_AUTH_TOKEN": "@twilio-token",
    "FIREBASE_PROJECT_ID": "@firebase-project",
    "PINECONE_API_KEY": "@pinecone-key"
  },
  "regions": ["iad1", "sfo1", "lhr1", "fra1", "syd1"],
  "routes": [
    {
      "src": "/api/voice/(.*)",
      "dest": "/api/voice/$1",
      "methods": ["GET", "POST"]
    }
  ]
}
```

**Environment Variables:**

```env
# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_ORG_ID=org-...

# Twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
TWILIO_API_KEY=SK...
TWILIO_API_SECRET=...

# Firebase
FIREBASE_PROJECT_ID=techsupport-ai
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_STORAGE_BUCKET=...

# Pinecone
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=us-west1-gcp
PINECONE_INDEX_NAME=techsupport-kb

# Resend (Email)
RESEND_API_KEY=re_...

# App Config
NEXT_PUBLIC_APP_URL=https://techsupport-ai.com
NEXT_PUBLIC_VISIONSCREEN_URL=https://vision.techsupport-ai.com
SESSION_SECRET=...
JWT_SECRET=...

# Feature Flags
ENABLE_RECORDING=true
ENABLE_VISIONSCREEN=true
ENABLE_L2_AUTO_ESCALATE=true
```

### Database Setup

**Firestore Initialization:**

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize project
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

**Security Rules:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Sessions: Write during call, read by agents
    match /sessions/{sessionId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && 
                      (request.auth.uid == resource.data.userId || 
                       request.auth.token.admin == true);
      allow update: if request.auth != null && 
                       request.auth.uid == resource.data.userId;
    }
    
    // Cases: Read/write by agents only
    match /cases/{caseId} {
      allow read, write: if request.auth != null && 
                            request.auth.token.admin == true;
    }
    
    // Playbooks: Read-only for AI, write for admins
    match /playbooks/{playbookId} {
      allow read: if true;
      allow write: if request.auth != null && 
                      request.auth.token.admin == true;
    }
  }
}
```

### Twilio Setup

**Phone Number Configuration:**

1. **Purchase Phone Number:**
   - Go to Twilio Console → Phone Numbers → Buy a Number
   - Select country and area code
   - Choose voice-capable number
   - Complete purchase

2. **Configure Webhooks:**
   - Voice & Fax → Configure
   - A Call Comes In: `https://techsupport-ai.com/api/voice/incoming` (POST)
   - Call Status Changes: `https://techsupport-ai.com/api/voice/status` (POST)
   - Save configuration

3. **Enable Capabilities:**
   - ✅ Voice
   - ✅ SMS
   - ✅ MMS (optional)
   - ✅ Fax (disabled)

### Monitoring Setup

**Vercel Analytics:**
- Automatically enabled
- Real-time metrics
- Web Vitals tracking
- API route monitoring

**External Monitoring:**
- UptimeRobot for uptime checks
- Sentry for error tracking
- LogRocket for session replay
- DataDog for infrastructure monitoring

**Custom Dashboards:**
- Grafana for metrics visualization
- Kibana for log analysis
- Firebase Console for database metrics

---

## API Reference

### Voice API Endpoints

#### POST /api/voice/incoming

**Purpose:** Handle incoming Twilio calls

**Request Body:** (Twilio standard payload)
```json
{
  "CallSid": "CA1234...",
  "From": "+15555551234",
  "To": "+15555559999",
  "CallStatus": "ringing"
}
```

**Response:** TwiML XML

```xml
<Response>
  <Say>Welcome to TechSupport AI</Say>
  <Gather input="speech" language="auto" />
</Response>
```

---

#### POST /api/voice/process

**Purpose:** Process user speech and generate AI response

**Request Body:**
```json
{
  "sessionId": "sess_abc123",
  "speechResult": "I can't log in to my account",
  "confidence": 0.95
}
```

**Response:**
```json
{
  "response": "I understand you're having login issues. Let me help you with that.",
  "action": "classify",
  "nextState": "troubleshooting_l1"
}
```

---

### Session API Endpoints

#### GET /api/sessions/:sessionId

**Purpose:** Retrieve session details

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "sessionId": "sess_abc123",
  "status": "active",
  "level": 1,
  "language": "en-US",
  "startTime": "2026-03-12T10:30:00Z",
  "case": {
    "caseId": "case_xyz789",
    "category": "login_authentication",
    "severity": "medium"
  },
  "timeline": [
    {
      "timestamp": "2026-03-12T10:30:05Z",
      "event": "language_detected",
      "details": {"language": "en-US", "confidence": 0.97}
    }
  ]
}
```

---

#### POST /api/sessions/:sessionId/escalate

**Purpose:** Escalate session to Level 2

**Request Body:**
```json
{
  "reason": "L1 playbook exhausted",
  "notes": "User completed all password reset steps but still cannot login"
}
```

**Response:**
```json
{
  "success": true,
  "newLevel": 2,
  "visionScreenUrl": "https://vision.techsupport-ai.com/session/sess_abc123?auth=..."
}
```

---

### VisionScreen API Endpoints

#### POST /api/visionscreen/create

**Purpose:** Create VisionScreen™ session

**Request Body:**
```json
{
  "sessionId": "sess_abc123",
  "expirationMinutes": 60
}
```

**Response:**
```json
{
  "visionScreenId": "vs_def456",
  "url": "https://vision.techsupport-ai.com/session/sess_abc123?auth=token123",
  "expiresAt": "2026-03-12T11:30:00Z",
  "smsMessage": "Click to connect visual support: https://vision.techsupport-ai.com/..."
}
```

---

#### POST /api/visionscreen/:visionScreenId/connect

**Purpose:** Establish WebRTC connection

**Request Body:**
```json
{
  "sdp": "...",
  "mode": "screen" | "camera"
}
```

**Response:**
```json
{
  "connected": true,
  "mode": "screen",
  "quality": "high",
  "latency": 127
}
```

---

### Analytics API Endpoints

#### GET /api/analytics/summary

**Purpose:** Get analytics summary

**Query Parameters:**
- `startDate`: ISO 8601 date
- `endDate`: ISO 8601 date
- `groupBy`: "day" | "week" | "month"

**Response:**
```json
{
  "period": {
    "start": "2026-03-01",
    "end": "2026-03-12"
  },
  "metrics": {
    "totalCalls": 1247,
    "level1Resolutions": 832,
    "level2Escalations": 356,
    "humanEscalations": 59,
    "averageHandleTime": 6.8,
    "satisfactionScore": 4.3,
    "languages": {
      "en-US": 745,
      "fr-FR": 201,
      "de-DE": 145,
      "it-IT": 89,
      "zh-CN": 45,
      "fa-IR": 22
    }
  }
}
```

---

## Integration with NOFA AI Factory

### Related Systems

**CommandDesk AI™:**
- Receives escalations from email support
- Forwards technical issues to TechSupport AI
- Shared knowledge base (Pinecone)
- Unified case management

**CareerPilot AI™:**
- Product-specific support queries
- Resume builder troubleshooting
- Job search API issues
- Payment/billing questions

**AffiliateLedger AI™:**
- Affiliate dashboard issues
- Tracking problems
- Payout questions
- Integration support

**VisionWing™:**
- Visual content generation errors
- API integration support
- Performance issues

**MagazinifyAI™:**
- Content transformation problems
- Format conversion issues
- Template questions

**RFPMatch AI™:**
- Matching algorithm questions
- Response generation issues
- Integration support

### Cross-Platform Integration

**Shared Knowledge Base:**
- Pinecone index includes docs from all products
- Vector embeddings for semantic search
- Automatic knowledge base updates
- Unified search across products

**Unified Case Management:**
- Cases can reference multiple products
- Cross-product issue correlation
- Shared escalation paths
- Consolidated reporting

**Authentication:**
- Shared Firebase Auth
- Single sign-on (SSO)
- Unified user profiles
- Cross-platform permissions

**Analytics:**
- Consolidated dashboards
- Cross-product usage tracking
- Ecosystem health metrics
- Revenue attribution

---

## Best Practices

### For Optimal Performance

**Call Quality:**
- Use dedicated Twilio phone numbers per region
- Configure WebRTC fallback
- Monitor latency continuously
- Test speech recognition accuracy regularly

**Playbook Design:**
- Keep steps atomic and clear
- Validate after each step
- Provide clear failure paths
- Include user-friendly language
- Test with real users

**VisionScreen™:**
- Always offer camera fallback
- Check network quality before connecting
- Provide clear visual instructions
- Respect user privacy preferences
- Monitor connection stability

**Multilingual Support:**
- Have native speakers review translations
- Test RTL layouts thoroughly
- Consider cultural context
- Update translations with product changes

### For Cost Optimization

**OpenAI API:**
- Use GPT-4 only for L1 classification
- Use GPT-4 Turbo for L2 deep reasoning
- Cache common responses
- Implement response streaming
- Monitor token usage

**Twilio:**
- Minimize call duration
- Use SMS for follow-ups instead of callbacks
- Implement efficient voice prompts
- Monitor per-minute costs by region

**Firebase:**
- Optimize Firestore queries
- Use composite indexes
- Implement data archiving
- Monitor read/write operations

**VisionScreen™:**
- Only activate in L2
- Use adaptive bitrate
- Implement connection timeout
- Gracefully degrade quality

### For Security

**Access Control:**
- Implement principle of least privilege
- Regular access audits
- MFA for all admin accounts
- API key rotation schedule

**Data Protection:**
- Encrypt all PII
- Hash phone numbers
- Redact sensitive information from logs
- Implement data retention policies

**Compliance:**
- Obtain proper consent
- Document data processing
- Regular compliance audits
- Privacy policy updates

---

## Troubleshooting Guide

### Common Issues

#### Issue: Language Detection Fails

**Symptoms:**
- AI responds in wrong language
- Caller reports language mismatch

**Causes:**
- Noisy environment
- Heavy accent
- Mixed language speech

**Solutions:**
1. Increase detection confidence threshold to 95%
2. Extend detection window to 5 seconds
3. Implement manual language selection fallback
4. Add confirmation step

---

#### Issue: VisionScreen™ Won't Connect

**Symptoms:**
- SMS link sent but connection fails
- WebRTC timeout errors

**Causes:**
- Network issues
- Browser compatibility
- Firewall blocking WebRTC
- Permission denied

**Solutions:**
1. Check browser compatibility (Chrome, Firefox, Safari, Edge)
2. Verify WebRTC is not blocked by firewall/VPN
3. Offer camera mode fallback
4. Send troubleshooting guide SMS

---

#### Issue: High Escalation Rate

**Symptoms:**
- >40% of L1 calls escalate to L2
- FCR rate below target

**Causes:**
- Playbooks incomplete
- Classification inaccurate
- Complex issues increase
- Inadequate knowledge base

**Solutions:**
1. Analyze escalation reasons in analytics
2. Identify pattern of unresolved categories
3. Update playbooks with missing steps
4. Expand knowledge base
5. Retrain classification model

---

#### Issue: Poor Call Quality

**Symptoms:**
- Audio cutting out
- High latency
- Dropped calls

**Causes:**
- Network congestion
- Twilio regional issues
- Server overload

**Solutions:**
1. Check Twilio status page
2. Verify Vercel function limits
3. Implement CDN for static assets
4. Monitor network latency
5. Scale serverless functions

---

## Change Log

**v1.0 - March 12, 2026**
- Initial technical knowledge base creation
- Comprehensive documentation of all systems
- Level 1 and Level 2 architecture
- VisionScreen™ technical specifications
- Multilingual support details
- Integration guides and API reference
- Best practices and troubleshooting

---

**Document Owner:** NOFA Business Consulting LLC  
**Product:** TechSupport AI™ (L1) + TechSupport AI-2™ (L2)  
**Technology:** VisionScreen™  
**Platform:** NOFA AI Factory™  
**Status:** Production Technical Documentation
