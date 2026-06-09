from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import pdfplumber
import numpy as np
import re
import io

app = FastAPI()
model = SentenceTransformer("all-MiniLM-L6-v2")

# ── Comprehensive skill dictionary ───────────────────────
# Used for both parse-resume and missing-skill detection.
# Dynamic extraction from JD is the primary strategy, but this
# list catches well-known multi-word terms that regex might miss.
KNOWN_SKILLS = [
    # Languages
    "Python", "Java", "JavaScript", "TypeScript", "C++", "C#", "Go", "Rust",
    "Kotlin", "Swift", "PHP", "Ruby", "Scala", "R",
    # Frontend
    "React", "React.js", "Next.js", "Vue", "Angular", "Tailwind CSS",
    "HTML", "CSS", "Redux",
    # Backend / Frameworks
    "Spring Boot", "Spring Security", "Spring MVC", "Hibernate", "FastAPI",
    "Django", "Flask", "Node.js", "Express", "GraphQL", "REST API",
    "Microservices", "gRPC",
    # Databases
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch",
    "Cassandra", "SQLite", "Oracle", "DynamoDB", "HBase",
    # DevOps / Infra
    "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Terraform",
    "GitHub Actions", "Jenkins", "CI/CD", "Linux", "Nginx",
    # AI / ML / Data
    "Machine Learning", "Deep Learning", "NLP", "LLM", "RAG",
    "sentence-transformers", "PyTorch", "TensorFlow", "scikit-learn",
    "Pandas", "NumPy", "Spark", "Hadoop", "Hive", "Kafka",
    "Langchain", "OpenAI", "Hugging Face", "Vector Database",
    # Auth / Security
    "JWT", "OAuth", "BCrypt",
    # Tools
    "Git", "Maven", "Gradle", "Postman", "Jira", "IntelliJ",
]


# ── Models ───────────────────────────────────────────────
class MatchRequest(BaseModel):
    resumeText: str
    jobDescription: str


class MatchResponse(BaseModel):
    matchScore: float
    missingSkills: list[str]


class ParseResponse(BaseModel):
    parsedText: str
    extractedSkills: list[str]


# ── Helpers ──────────────────────────────────────────────
def extract_skills_from_text(text: str, reference_skills: list[str]) -> list[str]:
    """Return skills from reference_skills that appear in text (case-insensitive)."""
    text_lower = text.lower()
    return [s for s in reference_skills if s.lower() in text_lower]


def extract_jd_keywords(jd_text: str) -> list[str]:
    """
    Dynamically pull candidate skill tokens from the JD.
    Strategy: split on whitespace/punctuation, keep tokens that look like
    tech terms (CamelCase, all-caps, or known multi-word patterns), then
    deduplicate. This catches things like 'Tailwind', 'Hibernate', 'gRPC'
    that aren't in KNOWN_SKILLS.
    """
    # First grab everything from KNOWN_SKILLS that appears in JD
    known_in_jd = extract_skills_from_text(jd_text, KNOWN_SKILLS)

    # Then extract capitalized / all-caps single tokens not already captured
    tokens = re.findall(r'\b[A-Z][a-zA-Z0-9+#.]*[a-zA-Z0-9]\b|\b[A-Z]{2,}\b', jd_text)
    # Filter noise: must be ≥ 2 chars, not generic stopwords
    stopwords = {"We", "Our", "The", "You", "Your", "Must", "Will", "With",
                 "Have", "This", "That", "And", "For", "Are", "Can", "Should",
                 "Experience", "Work", "Team", "Role", "Job", "Strong", "Good",
                 "Ability", "Using", "Build", "Join", "About", "Plus", "Nice"}
    dynamic = [t for t in tokens if len(t) >= 2 and t not in stopwords]

    # Merge, deduplicate (case-insensitive), preserve original casing
    seen = set()
    merged = []
    for skill in known_in_jd + dynamic:
        key = skill.lower()
        if key not in seen:
            seen.add(key)
            merged.append(skill)

    return merged


def compute_match_score(resume_text: str, jd_text: str) -> float:
    """
    Hybrid score = 70% semantic similarity (normalised) + 30% keyword overlap.

    Raw cosine from all-MiniLM-L6-v2 clusters between ~0.15 and ~0.65 for
    real-world resume/JD pairs. We normalise that range to [0, 1] before
    blending so the final percentage feels meaningful to a human reader.
    """
    # — Semantic component —
    resume_emb = model.encode([resume_text])
    jd_emb = model.encode([jd_text])
    raw_cosine = float(cosine_similarity(resume_emb, jd_emb)[0][0])

    # Clamp and normalise: treat 0.15 as 0% and 0.70 as 100%
    low, high = 0.15, 0.70
    normalised_semantic = max(0.0, min(1.0, (raw_cosine - low) / (high - low)))

    # — Keyword overlap component —
    jd_keywords = extract_jd_keywords(jd_text)
    if jd_keywords:
        resume_lower = resume_text.lower()
        matched = sum(1 for kw in jd_keywords if kw.lower() in resume_lower)
        keyword_score = matched / len(jd_keywords)
    else:
        keyword_score = normalised_semantic  # fallback if JD has no detectable keywords

    # — Blend —
    blended = 0.70 * normalised_semantic + 0.30 * keyword_score
    return round(blended, 4)


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

    found_skills = extract_skills_from_text(text, KNOWN_SKILLS)
    return ParseResponse(parsedText=text, extractedSkills=found_skills)


# ── JD Matcher ────────────────────────────────────────────
@app.post("/match-jd", response_model=MatchResponse)
def match_jd(request: MatchRequest):
    match_score = compute_match_score(request.resumeText, request.jobDescription)

    # Missing skills: present in JD but not in resume
    jd_keywords = extract_jd_keywords(request.jobDescription)
    resume_lower = request.resumeText.lower()
    missing = [kw for kw in jd_keywords if kw.lower() not in resume_lower]

    return MatchResponse(matchScore=match_score, missingSkills=missing)