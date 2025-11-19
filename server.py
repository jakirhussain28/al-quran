# main.py
import os
import time
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Enable CORS for your Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Default Vite port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
# Using Pre-live environment as per your server.py [cite: 575, 672]
TOKEN_URL = "https://prelive-oauth2.quran.foundation/oauth2/token"
BASE_URL = "https://apis-prelive.quran.foundation/content/api/v4"

# Simple in-memory token cache
token_store = {
    "access_token": None,
    "expires_at": 0
}

async def get_valid_token():
    """
    Handles OAuth2 Client Credentials flow with caching[cite: 307].
    """
    current_time = time.time()
    
    # Return cached token if valid (with 60s buffer)
    if token_store["access_token"] and current_time < token_store["expires_at"] - 60:
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
            # Token usually valid for 3600 seconds [cite: 546]
            token_store["expires_at"] = current_time + data.get("expires_in", 3600)
            
            return token_store["access_token"]
        except httpx.HTTPStatusError as e:
            print(f"Auth Failed: {e.response.text}")
            raise HTTPException(status_code=401, detail="Authentication failed")

async def make_api_request(endpoint: str, params: dict = {}):
    """
    Generic helper to call Quran Foundation API[cite: 398].
    """
    token = await get_valid_token()
    
    headers = {
        "x-auth-token": token,
        "x-client-id": CLIENT_ID
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}{endpoint}", headers=headers, params=params)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return response.json()

@app.get("/api/chapters")
async def get_chapters():
    """Fetches all chapters[cite: 106]."""
    return await make_api_request("/chapters")

@app.get("/api/chapters/{chapter_id}/verses")
async def get_verses(chapter_id: int, page: int = 1):
    """
    Fetches verses for a chapter.
    Requesting English translation (131) and Uthmani text[cite: 460].
    """
    params = {
        "language": "en",
        "words": "false",
        "translations": "131", # 131 is a standard English translation ID
        "fields": "text_uthmani",
        "page": page,
        "per_page": 10
    }
    # Endpoint format based on Verses API [cite: 482]
    return await make_api_request(f"/verses/by_chapter/{chapter_id}", params)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)