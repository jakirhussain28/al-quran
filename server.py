import os
import time
from typing import Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import httpx
from dotenv import load_dotenv
import uvicorn

# Load environment variables
load_dotenv()

app = FastAPI()

# --- CONFIGURATION ---
# Allow requests from your React frontend (default Vite port 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")

# API Endpoints (using Pre-live environment as per documentation)
# [cite: 99, 147]
TOKEN_URL = "https://prelive-oauth2.quran.foundation/oauth2/token"
BASE_URL = "https://apis-prelive.quran.foundation/content/api/v4"

# In-memory cache for the access token
token_store = {
    "access_token": None,
    "expires_at": 0
}

# --- AUTHENTICATION HELPER ---
async def get_valid_token():
    """
    Handles OAuth2 Client Credentials flow.
    Checks if the cached token is still valid before requesting a new one.
    """
    current_time = time.time()
    
    # Reuse token if it's valid (with a 60-second buffer)
    if token_store["access_token"] and current_time < token_store["expires_at"] - 60:
        return token_store["access_token"]

    print("🔄 Refreshing Access Token...")
    async with httpx.AsyncClient() as client:
        try:
            # [cite_start]Request new token [cite: 99-101]
            response = await client.post(
                TOKEN_URL,
                auth=(CLIENT_ID, CLIENT_SECRET),
                data={"grant_type": "client_credentials", "scope": "content"},
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            response.raise_for_status()
            data = response.json()
            
            token_store["access_token"] = data["access_token"]
            # [cite_start]Update expiration (default is 3600 seconds / 1 hour) [cite: 96, 135]
            token_store["expires_at"] = current_time + data.get("expires_in", 3600)
            
            return token_store["access_token"]
        except httpx.HTTPStatusError as e:
            print(f"❌ Auth Failed: {e.response.text}")
            raise HTTPException(status_code=401, detail="Authentication failed")

# --- API REQUEST HELPER ---
async def make_api_request(endpoint: str, params: dict = {}):
    """
    Attaches the required headers (x-auth-token, x-client-id) and makes the request.
    """
    token = await get_valid_token()
    
    # [cite_start]Headers required by Quran Foundation API [cite: 140-142, 600]
    headers = {
        "x-auth-token": token,
        "x-client-id": CLIENT_ID
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{BASE_URL}{endpoint}", headers=headers, params=params)
            
            if response.status_code != 200:
                print(f"❌ API Error {response.status_code}: {response.text}")
                raise HTTPException(status_code=response.status_code, detail=response.text)
                
            return response.json()
        except httpx.RequestError as e:
            raise HTTPException(status_code=503, detail=f"Connection error: {str(e)}")

# --- ROUTES ---

@app.get("/api/chapters")
async def get_chapters():
    """
    Fetches the list of all 114 chapters.
    """
    # [cite: 144, 252]
    return await make_api_request("/chapters")

@app.get("/api/chapters/{chapter_id}/verses")
async def get_verses(chapter_id: int, page: int = Query(1, ge=1)):
    """
    Fetches verses for a specific chapter with pagination.
    Hardcoded to load 7 verses per page.
    """
    params = {
        "language": "en",           # Metadata language
        "words": "false",           # Don't fetch word-by-word data (reduces payload)
        "translations": "131",      # 131 = Dr. Mustafa Khattab (The Clear Quran) [cite: 454]
        "fields": "text_uthmani",   # Request Arabic Uthmani script [cite: 452]
        "page": page,               # Current page number [cite: 479]
        "per_page": 7               # Limit to 7 verses per request [cite: 478]
    }
    
    # [cite_start]Calls the 'verses by chapter' endpoint [cite: 471, 476]
    return await make_api_request(f"/verses/by_chapter/{chapter_id}", params)

if __name__ == "__main__":
    # Run the server on port 8000
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)