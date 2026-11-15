
PitchPilot AI
A Personalized Conversational Training System for Sales Agents Using Large Language Models

Launch PitchPilot AI · API health · Hugging Face inference

PitchPilot AI is a web-based academic prototype that lets sales agents practise sales conversations with an AI-simulated customer, receive structured post-session feedback, and track training progress. Administrators manage accounts and team assignments, while managers review the performance of agents assigned to them.

The application is deployed publicly. Its functionality has been exercised through live end-to-end tests; this does not imply independent validation of sales-training effectiveness, production availability, or a formal security audit.

Live system
Component	Service	Address
React frontend	Cloudflare Pages	pitchpilot-ai.tech
Express REST API	Render	api.pitchpilot-ai.tech
PostgreSQL	Neon	Managed database; connection credentials are private
AI customer simulator	Hugging Face Gradio / ZeroGPU	PitchPilot-Inference
Transactional email	Resend HTTPS API	Verified sending subdomain, mail.pitchpilot-ai.tech
Domain / DNS / HTTPS	Name.com + Cloudflare	pitchpilot-ai.tech
Architecture
Browser: https://pitchpilot-ai.tech
                |
         React + Vite frontend
                |
                v
  Express API: https://api.pitchpilot-ai.tech/api
       |                  |                 |
       v                  v                 v
  Neon PostgreSQL   Hugging Face       Resend HTTPS API
  users, roles,     ZeroGPU Space      OTP and invitations
  scenarios,        fine-tuned Llama
  transcripts,      customer replies
  evaluations
       ^
       |
  Backend evaluation workflow
  (separate from customer simulation)
Model responsibilities: A fine-tuned Meta Llama 3.1 8B Instruct model powers simulated customer responses through the Hugging Face Space. Post-session scoring and feedback are handled separately by the backend evaluation workflow. The Gradio /chat endpoint does not itself generate validated competency scores, and automated feedback should not be interpreted as independently verified assessment.

Implemented features
Sales Agent

Register and log in with email/password, email OTP verification, or Google Sign-In.
Browse training scenarios and review the customer context and objectives.
Start sessions, exchange messages with a simulated customer, and revisit conversation history.
Complete a session through End & Evaluate, view strengths, improvement areas and competency feedback, and review saved progress and past sessions.
Sales Manager

Activate an invited manager account or use an existing agent account promoted by an administrator.
Access the Manager Dashboard and review training reports for assigned agents only.
Administrator

Access protected platform and user-management dashboards.
Invite new managers, promote eligible verified Sales Agents to managers, and suspend/reactivate eligible accounts.
Assign and reassign Sales Agents to managers.
Core authentication, simulated conversation, feedback display, manager invitations, promotions and assignment restrictions have been exercised in the deployed application. Further systematic testing remains appropriate.

AI model and data
Base model: meta-llama/Llama-3.1-8B-Instruct.
Fine-tuning: supervised fine-tuning with QLoRA / PEFT in Google Colab.
Domain data: curated SaaS sales conversations, filtered and divided by original conversation to help limit train/test leakage.
Adapter: K1-mberlyyy/PitchPilot-AI (may require authorized access).
Serving: Wanj1ru/PitchPilot-Inference, a Gradio ZeroGPU Space exposing /chat.
Inference inputs: customer persona, latest salesperson message and conversation history.
The project report contains dataset selection, preprocessing, fine-tuning configuration and held-out model metrics. Token-prediction accuracy, loss and perplexity should not be interpreted as proof of customer realism, usability, or improvement in real sales performance. The Hugging Face ZeroGPU service may have startup delays, resource limitations and intermittent availability.

Technology stack
Layer	Technologies
Frontend	React 19, Vite 8, React Router, Axios, Lucide React
Backend	Node.js, Express 5, REST API
Authentication	JWT, bcryptjs, one-time email verification, Google OAuth / OpenID Connect
Database	PostgreSQL (pg), hosted on Neon
Customer simulation	Llama 3.1 8B Instruct, QLoRA, Hugging Face, Gradio client
Feedback and evaluation	Backend post-session competency-feedback workflow
Transactional email	Resend REST API
Hosting and DNS	Cloudflare Pages, Render, Cloudflare DNS
Development	Git, GitHub, Google Colab
Repository layout
pitchpilot-ai/
├── client/                  # React / Vite web application
├── server/                  # Express REST API and PostgreSQL integration
│   ├── src/                # Controllers, services, routes and middleware
│   ├── scripts/            # Database / application maintenance scripts
│   ├── sql/                # SQL assets included in the repository
│   └── .env.example        # Development configuration template
├── huggingface-space/      # Gradio / ZeroGPU inference application
├── inference-service/      # Alternative experimental inference service
├── .gitignore
└── README.md
The fine-tuned model adapter is stored on Hugging Face, not as model weights in this GitHub repository. Raw training datasets, caches and model artifacts are excluded from version control.

Local development
Prerequisites
Node.js and npm compatible with the versions specified in the project package.json files.
PostgreSQL and the PitchPilot application schema.
Working credentials for the external integrations you enable (email, Google OAuth, and Hugging Face).
1. Clone the source
git clone https://github.com/Kimberly-Wangari/pitchpilot-ai.git
cd pitchpilot-ai
main is the production integration branch; use git switch develop for the latest development/integration changes when appropriate.

2. Configure and start the server
cd server
npm ci
Copy .env.example to .env and supply your own credentials. The sample file reflects the original development configuration; the deployed app additionally uses the variables listed below. Do not copy production secrets into Git.

# Application
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173
JWT_SECRET=generate-a-unique-long-random-secret
OTP_HASH_SECRET=generate-a-different-long-random-secret
OAUTH_COOKIE_SECRET=generate-another-long-random-secret

# PostgreSQL: either DATABASE_URL or the existing DB_* settings
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pitchpilot_db
DB_USER=postgres
DB_PASSWORD=your-local-database-password
# DATABASE_URL=postgresql://... (use only where appropriate)

# AI customer simulation
AI_PROVIDER=llama
HF_SPACE_ID=Wanj1ru/PitchPilot-Inference
HF_SPACE_TOKEN=your-authorized-hugging-face-token

# OTP emails / manager invitations
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=noreply@your-verified-sending-domain.example

# Google OAuth
GOOGLE_CLIENT_ID=your-web-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/oauth/google/callback
These are configuration examples, not usable secrets. The email sender must be an address authorized by your email provider. You can keep the original SMTP settings for other development configurations, but the current emailService.js sends OTP and invitation emails through Resend's HTTPS API.

Prepare the application schema before starting the system. This repository is not a one-command database bootstrap: a newly created PostgreSQL database does not automatically contain PitchPilot's tables, scenarios, relationships or required seed data. In the deployed environment, the PostgreSQL schema was migrated to Neon and the training scenarios were imported separately.

npm run dev
The API normally listens on http://localhost:5000 for local development.

3. Configure and start the frontend
In a second terminal:

cd client
npm ci
Create client/.env.local:

VITE_API_URL=http://localhost:5000/api
Then run:

npm run dev
Vite typically serves the development interface at http://localhost:5173.

For a production build:

npm run build
Important: VITE_API_URL already includes /api. Frontend requests should append /auth/..., /training-sessions/..., etc. — not /api/auth/..., which would produce an incorrect /api/api/ path.

Selected API routes
Method	Route	Purpose
GET	/api/health	Server health
GET	/api/database-health	PostgreSQL connectivity
POST	/api/auth/register	Register and request verification
POST	/api/auth/login	Password login and OTP challenge
POST	/api/auth/verify-otp	Verify registration/login code
GET	/api/oauth/google/start	Start Google Sign-In
GET	/api/oauth/google/callback	OAuth provider callback
POST	/api/oauth/exchange	Exchange one-time login ticket
GET	/api/scenarios	Scenario catalogue
POST	/api/training-sessions	Start a training session
GET	/api/training-sessions/my-progress	Agent progress/history
GET / POST	/api/training-sessions/:sessionId/messages	Read/send conversation messages
POST	/api/training-sessions/:id/end-and-evaluate	End session and request evaluation
GET	/api/training-sessions/:id/evaluation	Retrieve saved evaluation
GET	/api/manager/agents	Manager's assigned agents
GET	/api/manager/agents/:id	Authorized agent report
POST	/api/admin/managers	Create/invite manager
PATCH	/api/admin/users/:id/promote	Promote eligible agent
PATCH	/api/admin/teams/agents/:agentId/manager	Manage manager assignment
Most routes require a valid authenticated session, and administrative/manager endpoints enforce role checks in the backend. Consult server/src/routes/ for the complete current API contract.

Production deployment notes
Frontend — Cloudflare Pages

Setting	Value
Repository	Kimberly-Wangari/pitchpilot-ai
Production branch	main
Root directory	client
Build command	npm run build
Build output	dist
Production variable	VITE_API_URL=https://api.pitchpilot-ai.tech/api
Custom domain	pitchpilot-ai.tech
A new Pages production build is required after changing a VITE_* variable; these values are bundled into the generated frontend.

Backend — Render

Setting	Value
Service type	Node.js Web Service
Branch	main
Root directory	server
Build command	npm ci
Start command	npm start
Custom domain	api.pitchpilot-ai.tech
The backend uses Neon's production connection string in the private DATABASE_URL environment variable, plus separate authentication, OAuth, Hugging Face and Resend credentials. CLIENT_URL and FRONTEND_URL must point to https://pitchpilot-ai.tech. Google OAuth's authorized redirect URI must match https://api.pitchpilot-ai.tech/api/oauth/google/callback exactly. Neither the database nor secret values should be exposed to frontend environment variables.

Render free instances and Hugging Face ZeroGPU inference have service/resource restrictions; cold starts, timeouts and rate limits may occur. A successful deployment is not a service-level availability guarantee.

Security and privacy
Protect credentials with server-side environment variables; never commit .env, tokens, database URLs or private model access keys.
Enforce authorization in backend routes, not only through frontend navigation.
The system uses email OTPs, JWTs, verified account state and role-specific access checks.
OAuth uses a one-time, signed login-ticket exchange; frontend and API share the pitchpilot-ai.tech parent domain to support cookie handling.
Managers should access only agents assigned to them; administrators control assignments and promotions.
Treat transcripts and user-testing responses as potentially sensitive. Collect consent where necessary and publish only appropriately anonymized findings.
Avoid using real customer personal data in publicly accessible training prompts.
These measures are implementation features, not evidence of a completed penetration test.

Testing and research limitations
Deployment checks confirmed frontend–API connectivity, database health, OTP email delivery, Google Sign-In, simulated conversations, feedback generation, administrator and manager dashboards, manager invitations, promotions and assigned-agent reporting. Informal participant testing has also been conducted; sample size, instruments and responses should be described accurately in the academic report rather than invented here.

Outstanding research considerations include systematic usability evaluation, repeatable model-quality assessment, broader error-handling and load testing, security testing and evidence of any measurable change in sales readiness. AI-generated performance feedback should not be represented as a professionally certified score.

Version-control workflow
main — production integration and deployment branch.
develop — active integration branch.
feature/* — focused implementation branches.
Pull requests are used to review and merge completed changes.
Development and deployment issues should be tracked with truthful status and linked to their actual implementation commits or tests.

Academic context
PitchPilot AI is a final-year Computer Science research project on personalized conversational training for sales agents using large language models. It investigates how simulated customer interactions, feedback and progress review can support structured sales practice. The system is intended for academic research and demonstration rather than certified employee assessment or guaranteed sales-performance improvement.

Disclaimer
AI customer responses and automated feedback can be inaccurate or incomplete. They should be interpreted as learning aids, not as authoritative professional evaluations.





