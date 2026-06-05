```markdown
# HireAI — AI-Powered Job Portal

> A full-stack job portal where AI matches candidates to jobs using resume analysis and semantic similarity scoring.

[![Java CI](https://github.com/AashishBedi/HireAI/actions/workflows/ci.yml/badge.svg)](https://github.com/AashishBedi/HireAI/actions/workflows/ci.yml)

---

## Overview

HireAI is a production-grade job portal built with a Spring Boot backend, React frontend, and a FastAPI AI sidecar. It uses sentence-transformers to compute semantic similarity between a candidate's resume and job descriptions, ranking applicants by AI match score and identifying skill gaps.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   React Frontend                     │
│         (Job Seeker UI + Recruiter Dashboard)        │
└──────────────────────┬──────────────────────────────┘
                       │ REST API
┌──────────────────────▼──────────────────────────────┐
│              Spring Boot Core API (Port 8080)        │
│   Auth │ Jobs │ Applications │ Resume │ Email        │
└──────┬───────────────┬────────────────┬─────────────┘
       │               │                │
┌──────▼─────┐  ┌──────▼──────┐  ┌─────▼──────────┐
│ PostgreSQL │  │    Redis     │  │   JavaMailSender│
│  (main DB) │  │   (cache)   │  │  (Gmail SMTP)  │
└────────────┘  └─────────────┘  └────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│              FastAPI AI Sidecar (Port 8000)          │
│     Resume Parser │ JD Matcher │ Skill Extractor     │
└─────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Axios, Tailwind CSS v4 |
| Backend | Spring Boot 3.5, Java 21, Spring Security, JWT |
| Database | PostgreSQL 15 (via Docker) |
| Cache | Redis 7 (via Docker) |
| AI Sidecar | FastAPI, sentence-transformers, pdfplumber |
| Auth | JWT (JJWT 0.12.6), BCrypt |
| Email | JavaMailSender (Gmail SMTP) |
| DevOps | Docker Compose, GitHub Actions CI |

---

## Features

### Job Seeker
- Register and login with JWT authentication
- Browse and search jobs by skill and location
- Upload resume PDF — auto-parsed for skills and text
- Apply for jobs — AI instantly scores resume vs job description
- Track applications with color-coded status badges
- View AI match percentage and missing skills per application
- Receive email confirmation on application submission

### Recruiter
- Post jobs with required skills, location, and salary
- View all applicants ranked by AI match score (descending)
- See each applicant's name, email, match score, and skill gaps
- Update application status (APPLIED → REVIEWED → INTERVIEW → ACCEPTED/REJECTED)
- Applicant receives email notification on every status change

---

## Project Structure

```
HireAI/
├── backend/                    # Spring Boot API
│   ├── src/main/java/
│   │   └── com/aashish/jobportal/
│   │       ├── config/         # Redis, WebClient config
│   │       ├── controller/     # REST controllers
│   │       ├── dto/            # Request/Response DTOs
│   │       ├── entity/         # JPA entities
│   │       ├── enums/          # Role, JobStatus, ApplicationStatus
│   │       ├── exception/      # Global exception handler
│   │       ├── repository/     # Spring Data JPA repositories
│   │       ├── security/       # JWT filter, SecurityConfig
│   │       └── service/        # Business logic
│   ├── docker-compose.yml      # PostgreSQL + Redis
│   └── pom.xml
│
├── frontend/                   # React 18 app
│   └── src/
│       ├── api/                # Axios API modules
│       ├── components/         # Reusable UI components
│       ├── context/            # Auth context
│       └── pages/              # Route pages
│
├── ai_service/                 # FastAPI AI sidecar
│   ├── main.py                 # Resume parser + JD matcher
│   └── requirements.txt
│
└── .github/workflows/ci.yml    # GitHub Actions CI
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login, get JWT |
| GET | `/api/jobs` | Public | List jobs (paginated) |
| GET | `/api/jobs/search` | Public | Search by skill/location |
| POST | `/api/jobs` | RECRUITER | Post a job |
| POST | `/api/applications/{jobId}` | SEEKER | Apply for job |
| GET | `/api/applications/my` | SEEKER | My applications |
| GET | `/api/applications/job/{jobId}` | RECRUITER | Job applicants |
| PATCH | `/api/applications/{id}/status` | RECRUITER | Update status |
| POST | `/api/resume/upload` | SEEKER | Upload resume PDF |
| GET | `/api/resume/my` | SEEKER | Get my resume |

---

## Getting Started

### Prerequisites
- Java 21
- Node.js 18+
- Python 3.10+
- Docker Desktop

### 1. Start Infrastructure
```bash
cd backend
docker compose up -d
```

### 2. Configure Backend
Copy `backend/application.properties.example` to `backend/src/main/resources/application.properties` and fill in your values.

### 3. Run Backend
```bash
cd backend
./mvnw spring-boot:run
```
Backend starts at `http://localhost:8080`

### 4. Run AI Sidecar
```bash
cd ai_service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
AI service starts at `http://localhost:8000`

### 5. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend starts at `http://localhost:5173`

---

## Environment Variables

| Variable | Description |
|---|---|
| `SPRING_DATASOURCE_URL` | PostgreSQL connection URL |
| `SPRING_DATASOURCE_USERNAME` | DB username |
| `SPRING_DATASOURCE_PASSWORD` | DB password |
| `JWT_SECRET` | 256-bit hex secret |
| `JWT_EXPIRATION` | Token expiry in ms |
| `SPRING_MAIL_USERNAME` | Gmail address |
| `SPRING_MAIL_PASSWORD` | Gmail app password |

---

## CI/CD

GitHub Actions runs on every push to `main`:
- Checks out code
- Sets up JDK 21
- Caches Maven dependencies
- Compiles the Spring Boot backend

---

## Author

**Aashish Bedi**
- GitHub: [@AashishBedi](https://github.com/AashishBedi)
- LinkedIn: [linkedin.com/in/aashishbedi](https://linkedin.com/in/aashishbedi)
```
