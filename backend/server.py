import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
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
    allow_headers=["*"]
)

BASE_URL = "http://api.alquran.cloud/v1"

@app.get("/api/chapters")
async def get_chapters():
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{BASE_URL}/surah")
        data = resp.json()
        
        return {"chapters": [
            {
                "id": ch["number"],
                "name_simple": ch["englishName"],
                "name_arabic": ch["name"],
                "translated_name": {"name": ch["englishNameTranslation"]},
                "verses_count": ch["numberOfAyahs"],
                "name_complex": ch["englishName"]
            } 
            for ch in data["data"]
        ]}

@app.get("/api/chapters/{chapter_id}/verses")
async def get_all_verses(chapter_id: int):
    async with httpx.AsyncClient() as client:
        url = f"{BASE_URL}/surah/{chapter_id}/editions/quran-uthmani,en.sahih,ar.alafasy"
        
        response = await client.get(url)
        data = response.json()
        
        if data["code"] != 200:
            raise HTTPException(status_code=404, detail="Chapter not found")
            
        arabic_layer = data["data"][0]["ayahs"]
        translation_layer = data["data"][1]["ayahs"]
        audio_layer = data["data"][2]["ayahs"]
        
        mapped_verses = []
        
        for i in range(len(arabic_layer)):
            verse_num = arabic_layer[i]["numberInSurah"]
            
            mapped_verses.append({
                "id": arabic_layer[i]["number"],
                "verse_key": f"{chapter_id}:{verse_num}",
                "text_uthmani": arabic_layer[i]["text"],
                "translations": [
                    {"text": translation_layer[i]["text"]}
                ],
                "audio": {
                    "url": audio_layer[i]["audio"]
                }
            })
            
        return {
            "verses": mapped_verses, 
            "pagination": {
                "per_page": len(mapped_verses), 
                "total_pages": 1, 
                "current_page": 1
            }
        }