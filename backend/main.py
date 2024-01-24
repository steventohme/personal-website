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

app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}
