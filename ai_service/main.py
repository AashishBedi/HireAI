from fastapi import FastAPI, UploadFile, File  
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import pdfplumber
import numpy as np
import io

app = FastAPI()
model = SentenceTransformer("all-MiniLM-L6-v2")


# ── Models ──────────────────────────────────────────────
class MatchRequest(BaseModel):
    resumeText: str
    jobDescription: str


class MatchResponse(BaseModel):
    matchScore: float
    missingSkills: list[str]


class ParseResponse(BaseModel):
    parsedText: str
    extractedSkills: list[str]


# ── Health check ─────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok"}


# ── Resume Parser ─────────────────────────────────────────
@app.post("/parse-resume", response_model=ParseResponse)
async def parse_resume(file: UploadFile = File(...)):
    contents = await file.read()
    text = ""

    with pdfplumber.open(io.BytesIO(contents)) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""

    # Simple skill extraction — looks for common tech keywords
    common_skills = [
        "Python", "Java", "Spring Boot", "FastAPI", "React", "Node.js",
        "PostgreSQL", "MongoDB", "Redis", "Docker", "Kubernetes", "AWS",
        "Machine Learning", "Deep Learning", "NLP", "Spark", "Hadoop",
        "Hive", "SQL", "Git", "REST API", "Microservices", "RAG"
    ]
    found_skills = [s for s in common_skills if s.lower() in text.lower()]

    return ParseResponse(parsedText=text, extractedSkills=found_skills)


# ── JD Matcher ────────────────────────────────────────────
@app.post("/match-jd", response_model=MatchResponse)
def match_jd(request: MatchRequest):
    resume_embedding = model.encode([request.resumeText])
    jd_embedding = model.encode([request.jobDescription])

    score = cosine_similarity(resume_embedding, jd_embedding)[0][0]
    match_score = round(float(score), 4)

    # Detect missing skills from JD not in resume
    common_skills = [
        "Python", "Java", "Spring Boot", "FastAPI", "React", "Node.js",
        "PostgreSQL", "MongoDB", "Redis", "Docker", "Kubernetes", "AWS",
        "Machine Learning", "Deep Learning", "NLP", "Spark", "Hadoop",
        "Hive", "SQL", "Git", "REST API", "Microservices", "RAG"
    ]

    jd_lower = request.jobDescription.lower()
    resume_lower = request.resumeText.lower()

    missing = [
        skill for skill in common_skills
        if skill.lower() in jd_lower and skill.lower() not in resume_lower
    ]

    return MatchResponse(matchScore=match_score, missingSkills=missing)