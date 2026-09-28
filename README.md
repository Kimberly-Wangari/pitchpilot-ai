# PitchPilot AI

PitchPilot AI is a personalized conversational training system designed to help sales agents develop practical sales communication skills through AI-powered customer simulations.

The system allows sales agents to select training scenarios, participate in simulated customer interactions and eventually receive personalized feedback based on their performance. The project explores the use of Large Language Models (LLMs) in professional sales training and conversational learning.

## Project Objectives

PitchPilot AI aims to:

- Provide realistic conversational practice for sales agents
- Simulate different customer personas and sales situations
- Support skills such as objection handling, needs discovery, customer engagement and persuasive communication
- Provide personalized feedback based on agent interactions
- Support continuous sales training through an accessible web-based platform

## Current Features

The following features have currently been implemented:

- User registration and login
- JWT-based authentication
- Protected application routes
- Role-based user structure
- Sales training scenario library
- Scenario search and filtering
- Detailed training scenario pages
- Training session creation
- PostgreSQL database integration
- React frontend connected to a Node.js/Express REST API

## AI and Conversational Training

PitchPilot AI is being developed to integrate a pretrained instruction-tuned Large Language Model for simulated customer conversations.

The planned conversational workflow is:

Agent → React Interface → Node.js/Express API → LLM Inference → Simulated Customer Response

The backend will provide the model with contextual information including the selected scenario, customer persona, training objective and conversation history.

The project is currently experimenting with the Llama family of instruction-tuned models for conversational simulation.

## Datasets

Candidate sales conversation datasets are being evaluated for model adaptation, prompt development and evaluation.

These include:

- Sales Conversations Instruction Base
- DeepMostInnovations SaaS Sales Conversations
- SalesLLM-10k

Raw datasets and model weights are not stored in this GitHub repository due to their size. Dataset preparation and model experimentation are performed separately using Google Colab and Google Drive.

The final dataset selection will be based on relevance, quality, language and suitability for conversational sales training.

## Technology Stack

### Frontend
- React
- Vite
- React Router
- Axios

### Backend
- Node.js
- Express.js
- REST API
- JWT Authentication

### Database
- PostgreSQL

### AI / Machine Learning
- Llama
- Hugging Face
- Google Colab
- Python

### Development and Deployment
- Git
- GitHub
- AWS (planned deployment)

## Project Structure

```text
pitchpilot-ai/
│
├── client/
│   └── React frontend
│
├── server/
│   └── Node.js/Express backend
│
├── README.md
├── .gitignore
└── ...
```

## Application Workflow

```text
User Authentication
        ↓
Agent Dashboard
        ↓
Training Scenario Library
        ↓
Scenario Details
        ↓
Start Training Session
        ↓
Conversational AI Simulation
        ↓
Personalized Feedback
        ↓
Progress Tracking
```

## Database

The application uses PostgreSQL for persistent data storage.

Current database entities include:

- Users
- Training Scenarios
- Training Sessions

Additional entities for conversation messages, feedback and performance tracking will be introduced as development progresses.

## API

The backend exposes REST API endpoints for communication between the React frontend and the application services.

Current API functionality includes:

```text
/api/health
/api/auth
/api/scenarios
/api/training-sessions
```

Additional endpoints will support conversational messages, LLM interaction and personalized feedback.

## Security

Sensitive information is managed through environment variables and is not committed to the repository.

This includes:

- Database credentials
- JWT secrets
- Hugging Face access tokens
- Model API credentials
- Cloud credentials

The `.env` file is excluded from version control.

## Development Workflow

The project follows a Git-based development workflow using:

- `main` — stable/release version
- `develop` — integration branch
- `feature/*` — individual feature development

Features are developed separately and integrated through pull requests.

## Development Status

PitchPilot AI is currently under active development.

### Completed
- Authentication
- PostgreSQL integration
- Scenario library
- Scenario details
- Training session creation

### In Progress
- Training conversation interface
- Conversation persistence
- Dataset preprocessing
- LLM integration

### Planned
- Personalized feedback and scoring
- Agent progress tracking
- System evaluation and testing
- AWS deployment

## Academic Context

PitchPilot AI is being developed as a final-year Computer Science project investigating the use of Large Language Models for personalized conversational training in professional sales environments.

The project focuses on combining conversational AI, realistic customer simulations and personalized feedback to support the development of sales communication skills.

## Disclaimer

This project is intended for academic and research purposes. AI-generated training responses and feedback should be treated as training support rather than authoritative professional advice.
