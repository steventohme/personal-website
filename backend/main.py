from typing import Union
from fastapi import FastAPI
import asyncio
import websockets
import json
import base64
import shutil
import os
import subprocess
from openai import AsyncOpenAI
from dotenv import load_dotenv


app = FastAPI()
load_dotenv()

OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
ELEVENLABS_API_KEY = os.environ.get('ELEVENLABS_API_KEY')
VOICE_ID = os.environ.get('VOICE_ID')

aclient = AsyncOpenAI(api_key=OPENAI_API_KEY)


@app.get("/")
def read_root():
    return {"Hello": "World"}
