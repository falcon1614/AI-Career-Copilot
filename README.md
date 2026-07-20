# AI Career Copilot 🚀

> An AI-powered career preparation platform built with a modern microservices architecture.

AI Career Copilot helps students and job seekers improve their resumes, prepare for interviews, practice coding, analyze job opportunities, and receive personalized AI guidance through a unified platform.

---

# ✨ Features

## Authentication

* Secure JWT authentication
* User registration and login
* Refresh token support
* Password hashing with bcrypt
* Redis-based token blacklist

## Resume Analysis

* Upload PDF and DOCX resumes
* Resume parsing
* ATS compatibility analysis
* Resume management
* AI-powered resume feedback

## AI Career Assistant

* Resume improvement suggestions
* Resume rewriting
* Job description keyword analysis
* Personalized learning roadmap
* Interview question generation using Google Gemini

## Mock Interview

* Technical interviews
* Behavioral interviews
* HR interviews
* Session tracking
* AI answer evaluation
* Interview scoring

## Coding Practice

* Online code execution
* Python
* JavaScript
* C++
* Submission history
* Coding challenges

## Machine Learning

* Job matching
* Skill gap analysis
* Salary estimation
* Company recommendations
* Career insights

---

# 🏗 Architecture

```text
                        React + Vite Frontend
                               │
                               ▼
                      API Gateway (Express)
                               │
      ┌──────────────┬──────────────┬──────────────┐
      │              │              │              │
      ▼              ▼              ▼              ▼
 Auth Service   Resume Service Interview Service Coding Service
      │
      ├──────────────┐
      ▼              ▼
 PostgreSQL       Redis

             ┌─────────────────────────────┐
             │                             │
             ▼                             ▼
      GenAI Service (FastAPI)      ML Service (FastAPI)
```

---

# 🛠 Tech Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Zustand
* React Router
* Axios

## Backend

* Node.js
* Express.js
* TypeScript
* FastAPI
* Python

## Database

* PostgreSQL 16
* pgvector
* Redis

## AI

* Google Gemini API

## Infrastructure

* Docker
* Docker Compose
* Nginx (Production)
* GitHub Actions (CI/CD)

---

# 📁 Project Structure

```text
AI-Career-Copilot
│
├── frontend
│   ├── src
│   ├── public
│   └── package.json
│
├── services
│   ├── api-gateway
│   ├── auth-service
│   ├── resume-service
│   ├── interview-service
│   ├── coding-service
│   ├── genai-service
│   └── ml-service
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
└── README.md
```

---

# 🚀 Quick Start

## Prerequisites

* Docker
* Docker Compose
* Node.js 20+
* Python 3.11+
* Google Gemini API Key

---

## Clone Repository

```bash
git clone https://github.com/falcon1614/AI-Career-Copilot.git

cd AI-Career-Copilot
```

---

## Configure Environment

```bash
cp .env.example .env
```

Update the environment variables according to your setup.

---

## Start Services

```bash
docker compose up -d
```

Verify containers:

```bash
docker compose ps
```

---

## Run Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend:

```
http://localhost:5173
```

---

# 🐳 Docker Services

| Service           | Port | Description                 |
| ----------------- | ---- | --------------------------- |
| API Gateway       | 3000 | Reverse proxy & API routing |
| Auth Service      | 3001 | Authentication              |
| Resume Service    | 3002 | Resume upload & analysis    |
| Interview Service | 3003 | Mock interviews             |
| Coding Service    | 3004 | Coding judge                |
| GenAI Service     | 8001 | Google Gemini integration   |
| ML Service        | 8002 | Machine learning APIs       |
| PostgreSQL        | 5432 | Database                    |
| Redis             | 6379 | Cache & sessions            |
| pgAdmin           | 5050 | Database management         |
| Redis Commander   | 8081 | Redis management            |

---

# 📡 API Overview

## Authentication

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
```

---

## Resume

```http
POST   /api/resumes
GET    /api/resumes
GET    /api/resumes/:id
DELETE /api/resumes/:id
POST   /api/resumes/:id/analyze
```

---

## Interview

```http
POST   /api/interviews
GET    /api/interviews
GET    /api/interviews/:id
POST   /api/interviews/:id/answer
PUT    /api/interviews/:id/complete
DELETE /api/interviews/:id
```

---

## Coding

```http
GET    /api/coding/problems
GET    /api/coding/problems/:id
POST   /api/coding/submit
GET    /api/coding/submissions
GET    /api/coding/submissions/:id
```

---

## AI

```http
POST /api/genai/resume/feedback
POST /api/genai/resume/rewrite
POST /api/genai/resume/keywords
POST /api/genai/interview/questions
POST /api/genai/interview/roadmap
```

---

## Machine Learning

```http
POST /api/ml/job-match
POST /api/ml/skill-gap
POST /api/ml/salary-predict
POST /api/ml/companies
GET  /api/ml/market-insights
```

---

# ⚙ Environment Variables

Copy:

```bash
cp .env.example .env
```

Important variables include:

```env
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=

DATABASE_URL=

REDIS_URL=

JWT_SECRET=
JWT_REFRESH_SECRET=

GEMINI_API_KEY=
```

---

# 🧪 Development

Build containers:

```bash
docker compose build
```

Restart:

```bash
docker compose up -d
```

View logs:

```bash
docker compose logs -f
```

Run a single service:

```bash
docker compose up auth-service
```

---

# 🚀 Production Deployment

Recommended stack:

* Ubuntu Server
* Docker
* Docker Compose
* Nginx
* Let's Encrypt
* GitHub Actions
* PostgreSQL
* Redis

Deployment flow:

```text
Developer
     │
GitHub
     │
GitHub Actions
     │
Docker Build
     │
VPS
     │
Docker Compose
     │
Nginx
     │
HTTPS
     │
Custom Domain
```

---

# 📈 Future Roadmap

* OAuth Login (Google & GitHub)
* Real-time interview voice support
* AI career chatbot
* Resume templates
* Company-specific interview preparation
* Analytics dashboard
* Email notifications
* Premium subscription
* Admin dashboard
* Kubernetes deployment

---

# 🤝 Contributing

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push your branch.
5. Open a Pull Request.

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Jayant Kumar**

Computer Science Engineer

GitHub: https://github.com/falcon1614

Project: **AI Career Copilot**

Built with ❤️ using React, TypeScript, Node.js, FastAPI, PostgreSQL, Redis, Docker, and Google Gemini.
