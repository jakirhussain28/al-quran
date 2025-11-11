import requests

# ✅ Your credentials
CLIENT_ID = "e13ea0d5-600c-4dd3-bb68-346f1ab8d1e8"
CLIENT_SECRET = "UdoSNpE__ghp7bkj3eNKMWo5-B"

# ✅ Endpoints
TOKEN_URL = "https://prelive-oauth2.quran.foundation/oauth2/token"
API_URL = "https://apis-prelive.quran.foundation/content/api/v4/chapters"

# Step 1: Get Access Token
def get_access_token():
    response = requests.post(
        TOKEN_URL,
        auth=(CLIENT_ID, CLIENT_SECRET),
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data="grant_type=client_credentials&scope=content"
    )
    
    if response.status_code == 200:
        token = response.json()["access_token"]
        print("✅ Access Token Generated")
        return token
    else:
        print("❌ Failed to get token:", response.text)
        exit()

# Step 2: Call Quran API using Token
def get_chapters(token):
    response = requests.get(
        API_URL,
        headers={
            "x-auth-token": token,
            "x-client-id": CLIENT_ID
        }
    )

    if response.status_code == 200:
        print("✅ API Call Successful!\n")
        print(response.json())  # prints chapter data
    else:
        print("❌ API Error:", response.text)

# Run Flow
if __name__ == "__main__":
    token = get_access_token()
    get_chapters(token)
