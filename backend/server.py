import os
import time
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import httpx
from dotenv import load_dotenv

# Load environment variables
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

# Auth Configuration
# [cite_start]Using Client Credentials flow [cite: 13, 261]
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")

# Environments: Use Pre-production for testing or Production for live
# [cite_start]Pre-live URLs [cite: 139]
TOKEN_URL = "https://prelive-oauth2.quran.foundation/oauth2/token"
BASE_URL = "https://apis-prelive.quran.foundation/content/api/v4"

# Token Cache
# Note: In serverless, global variables reset on "cold starts".
# This cache will only work if the container is reused (warm start).
token_store = {"access_token": None, "expires_at": 0}

async def get_valid_token():
    """
    Handles OAuth2 Client Credentials flow.
    [cite_start]Tokens are valid for 1 hour (3600 seconds)[cite: 13].
    """
    global token_store
    
    # Check if token exists and is not expiring within the next 60 seconds
    if token_store["access_token"] and time.time() < token_store["expires_at"] - 60:
        return token_store["access_token"]

    async with httpx.AsyncClient() as client:
        try:
            # [cite_start]Requesting token using client_credentials grant type [cite: 216, 45]
            payload = {
                "grant_type": "client_credentials", 
                "scope": "content"
            }
            auth = (CLIENT_ID, CLIENT_SECRET) # [cite: 44]
            
            response = await client.post(
                TOKEN_URL,
                auth=auth,
                data=payload,
                headers={"Content-Type": "application/x-www-form-urlencoded"} # [cite: 32]
            )
            response.raise_for_status()
            data = response.json()
            
            token_store["access_token"] = data["access_token"]
            # [cite_start]Default to 3600 seconds if expires_in is missing [cite: 13]
            token_store["expires_at"] = time.time() + data.get("expires_in", 3600)
            
            return token_store["access_token"]
        except httpx.HTTPError as e:
            print(f"Auth Error: {e}")
            raise HTTPException(status_code=401, detail="Authentication failed")

async def make_request(endpoint: str, params: dict = {}):
    """
    Helper to make authenticated requests to the Content API.
    """
    token = await get_valid_token()
    
    # [cite_start]Headers required: x-auth-token and x-client-id [cite: 57-59, 229]
    headers = {
        "x-auth-token": token, 
        "x-client-id": CLIENT_ID
    }
    
    async with httpx.AsyncClient() as client:
        # [cite_start]Appending endpoint to the specific base URL [cite: 150-153]
        resp = await client.get(f"{BASE_URL}{endpoint}", headers=headers, params=params)
        
        if resp.status_code != 200:
            # Pass through upstream errors
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
            
        return resp.json()


@app.get("/api/chapters")
async def get_chapters():
    # [cite_start]Fetches list of all chapters [cite: 61, 168]
    return await make_request("/chapters")

@app.get("/api/chapters/{chapter_id}/verses")
async def get_verses(chapter_id: int, page: int = 1):
    # Fetches verses. [cite_start]Example translation 131 is Clear Quran [cite: 18-19]
    # [cite_start]Using fields parameter to request Uthmani text [cite: 620]
    params = {
        "language": "en",
        "words": "false",
        "translations": "131", 
        "fields": "text_uthmani",
        "page": page,
        "per_page": 10
    }
    return await make_request(f"/verses/by_chapter/{chapter_id}", params)