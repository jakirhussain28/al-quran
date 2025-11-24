import os
import re
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

# CORS Configuration
origins = [
    "https://alquran-furqan.vercel.app",
    "https://alquran-foundation.vercel.app",
    "https://quran-furqan.vercel.app",
    "http://localhost:5000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Use Public Production URL (No Auth Required)
BASE_URL = "https://api.quran.com/api/v4"

async def make_request(endpoint: str, params: dict = {}):
    async with httpx.AsyncClient() as client:
        # Request to public API - no auth headers needed
        resp = await client.get(f"{BASE_URL}{endpoint}", params=params)
        
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
            
        return resp.json()

@app.get("/api")
async def api_root():
    return {"status": "ok", "message": "Quran API Proxy (Public) Ready"}

@app.get("/api/chapters")
async def get_chapters():
    return await make_request("/chapters")

@app.get("/api/chapters/{chapter_id}/verses")
async def get_verses(chapter_id: int, page: int = 1):
    params = {
        "language": "en",
        "words": "false",
        "translations": "20",   # Saheeh International
        "audio": "7",           # Mishari Rashid al-Afasy
        "fields": "text_uthmani",
        "page": page,
        "per_page": 10
    }
    
    # 1. Fetch raw data
    data = await make_request(f"/verses/by_chapter/{chapter_id}", params)
    
    # 2. Clean Footnotes and Normalize Spaces
    if "verses" in data:
        for verse in data["verses"]:
            if "translations" in verse:
                for translation in verse["translations"]:
                    original_text = translation["text"]
                    text_no_tags = re.sub(r'<sup\b[^>]*>[\s\S]*?</sup>', '', original_text)
                    clean_text = re.sub(r'\s+', ' ', text_no_tags).strip()
                    translation["text"] = clean_text
    return data