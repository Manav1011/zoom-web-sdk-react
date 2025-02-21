from fastapi import FastAPI, HTTPException
import httpx
import base64
import os
from pydantic import BaseModel
from jose import jwt
import time
from datetime import datetime, timezone
from fastapi.middleware.cors import CORSMiddleware
from urllib.parse import urlencode
import requests
import re
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

CLIENT_ID = "WhLQPPJlTxWruMsIytdBDg"
CLIENT_SECRET = "q6IVGBY0iP7Vohq36juEpq98qc31v9qy"

ZOOM_MEETING_SDK_KEY="GVkI9tvlSEasIJ_WSNL0UA"
ZOOM_MEETING_SDK_SECRET="TLDgM3nPUNO3s9SuuBDYsgQgSOHx76CP"


ACCOUNT_ID = "57tQLQJgTcm94krYW0znUw"
API_BASE_URL = "https://api.zoom.us/v2"
TOKEN_URL = "https://zoom.us/oauth/token"

# ZOOM_MEETING_SDK_KEY="GVkI9tvlSEasIJ_WSNL0UA"
# ZOOM_MEETING_SDK_SECRET="TLDgM3nPUNO3s9SuuBDYsgQgSOHx76CP"


ZOOM_REDIRECT_URI = 'https://d215-113-212-87-44.ngrok-free.app' 
ZOOM_AUTH_URL = "https://zoom.us/oauth/authorize"
ZOOM_TOKEN_URL = "https://zoom.us/oauth/token"


class MeetingRequest(BaseModel):
    meetingPassword: str
    meetingTopic: str
    questionType: str
    silenceDetectionTime: int
    accessToken: str
    userName:str

class SignatureRequest(BaseModel):
    meetingNumber: str
    role: int
    expirationSeconds: int = 7200

async def get_access_token():
    auth_header = base64.b64encode(f"{CLIENT_ID}:{CLIENT_SECRET}".encode()).decode()
    async with httpx.AsyncClient() as client:
        response = await client.post(
            TOKEN_URL,
            data={"grant_type": "account_credentials", "account_id": ACCOUNT_ID},
            headers={
                "Authorization": f"Basic {auth_header}",
                "Content-Type": "application/x-www-form-urlencoded",
            },
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.json())
        return response.json()["access_token"]

@app.get("/oauth/login")
async def zoom_oauth_login():
    """Redirects user to Zoom's OAuth authorization page."""
    params = {
        "response_type": "code",
        "client_id": CLIENT_ID,
        "redirect_uri": ZOOM_REDIRECT_URI,
    }
    zoom_login_url = f"{ZOOM_AUTH_URL}?{urlencode(params)}"
    return {"redirect_url": zoom_login_url}


@app.get("/access")
async def zoom_oauth_callback(code: str):
    """Handles Zoom's OAuth callback, exchanges code for an access token."""
    try:
        # Exchange authorization code for an access token
        payload = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": ZOOM_REDIRECT_URI,
        }
        auth_header = (CLIENT_ID, CLIENT_SECRET)
        
        response = requests.post(ZOOM_TOKEN_URL, data=payload, auth=auth_header)
        response_data = response.json()

        if "access_token" not in response_data:
            raise HTTPException(status_code=400, detail="Failed to get access token")

        return {
            "access_token": response_data["access_token"],
            "refresh_token": response_data["refresh_token"],
            "expires_in": response_data["expires_in"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def create_meeting(access_token, userId,topic,password):
    async with httpx.AsyncClient() as client:
        current_time = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")  # Get current UTC time
        response = await client.post(
            f"{API_BASE_URL}/users/{userId}/meetings",
            json={
                "topic": topic,
                "type": 2,
                "start_time":current_time,
                "duration": 60,
                "timezone": "UTC",
                "password": password,
                "agenda": "Discuss project updates",
            },
            headers={"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"},
        )
        if response.status_code != 201:
            raise HTTPException(status_code=response.status_code, detail=response.json())
        return response.json()


def get_zoom_user_id(access_token: str) -> str:
    """
    Fetches the Zoom user ID using the provided access token.
    
    :param access_token: The OAuth access token
    :return: The Zoom user ID if successful, otherwise raises an exception
    """
    url = "https://api.zoom.us/v2/users/me"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        return response.json().get("id")
    else:
        raise Exception(f"Failed to get user ID: {response.json()}")

async def get_user_zak_token(access_token,userId):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{API_BASE_URL}/users/{userId}/token",
            headers={"Authorization": f"Bearer {access_token}"},
            params={"type": "zak"},
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.json())
        return response.json()["token"]

def extract_meeting_id(zoom_url):
    """Extracts the meeting ID from a given Zoom URL."""
    match = re.search(r"/j/(\d+)", zoom_url)
    return match.group(1) if match else None

def generate_signature(meeting_id,role):
    try:
        iat = int(time.time())
        exp = iat + 60 * 60 * 2
        oHeader = {"alg": "HS256", "typ": "JWT"}
        oPayload = {
            "appKey": ZOOM_MEETING_SDK_KEY,
            "sdkKey": ZOOM_MEETING_SDK_KEY,
            "mn": meeting_id,
            "role": role,
            "iat": iat,
            "exp": exp,
            "tokenExp": exp
        }
        signature = jwt.encode(oPayload, ZOOM_MEETING_SDK_SECRET, algorithm="HS256")
        return {"signature": signature,'sdkKey':ZOOM_MEETING_SDK_KEY}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))    
    
@app.post("/create_meeting")
async def create_meeting_endpoint(request: MeetingRequest):
    try:
        access_token = request.accessToken
        # to creatre the meeting we need to get user's id
        user_id = get_zoom_user_id(access_token)
        meeting_data = await create_meeting(access_token,user_id,request.meetingTopic,request.meetingPassword)
        zak_token = await get_user_zak_token(access_token,user_id)
        meeting_id = extract_meeting_id(meeting_data['join_url'])
        signature_response = generate_signature(meeting_id,role=1)
        return {"meeting_url":meeting_data['join_url'],"meeting_id": meeting_id,"password":request.meetingPassword,"userName":request.userName, "zak": zak_token,"meetingTopic":request.meetingTopic,"questionType":request.questionType,"silenceDetectionTime":request.silenceDetectionTime,'signature':signature_response['signature'],'sdkKey':signature_response['sdkKey']}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))