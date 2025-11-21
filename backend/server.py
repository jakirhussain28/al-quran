import os
import time
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import httpx
from dotenv import load_dotenv
import uvicorn

load_dotenv()

app = FastAPI()

@app.get("/")   #check
async def health_check():
    return "Health check is successfull"

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

# Auth Configuration [cite: 29, 30]
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
TOKEN_URL = "https://prelive-oauth2.quran.foundation/oauth2/token"
BASE_URL = "https://apis-prelive.quran.foundation/content/api/v4"

# Token Cache
token_store = {"access_token": None, "expires_at": 0}

async def get_valid_token():
    """Handles OAuth2 Client Credentials flow with caching [cite: 60, 105-108]."""
    if token_store["access_token"] and time.time() < token_store["expires_at"] - 60:
        return token_store["access_token"]

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                TOKEN_URL,
                auth=(CLIENT_ID, CLIENT_SECRET),
                data={"grant_type": "client_credentials", "scope": "content"},
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            response.raise_for_status()
            data = response.json()
            token_store["access_token"] = data["access_token"]
            token_store["expires_at"] = time.time() + data.get("expires_in", 3600)
            return token_store["access_token"]
        except httpx.HTTPError as e:
            print(f"Auth Error: {e}")
            raise HTTPException(status_code=401, detail="Authentication failed")

async def make_request(endpoint: str, params: dict = {}):
    token = await get_valid_token()
    headers = {"x-auth-token": token, "x-client-id": CLIENT_ID} # [cite: 73, 228-230]
    
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{BASE_URL}{endpoint}", headers=headers, params=params)
        return resp.json()

@app.get("/api/chapters")
async def get_chapters():
    # Fetches list of all chapters [cite: 16, 232]
    return await make_request("/chapters")

@app.get("/api/chapters/{chapter_id}/verses")
async def get_verses(chapter_id: int, page: int = 1):
    # Fetches verses with specific translation (131: Clear Quran) [cite: 18-19, 117]
    params = {
        "language": "en",
        "words": "false",
        "translations": "131", 
        "fields": "text_uthmani",
        "page": page,
        "per_page": 10
    }
    return await make_request(f"/verses/by_chapter/{chapter_id}", params)

# if __name__ == "__main__":
#     uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)