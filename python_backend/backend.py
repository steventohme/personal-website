import asyncio
import websockets
import json
import base64
import os
import subprocess
import shutil
from dotenv import load_dotenv
from openai import AsyncOpenAI
from openai import OpenAI
from flask import Flask, request, jsonify

# Load environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID")

openai = OpenAI(api_key=OPENAI_API_KEY)


with open("base_prompt.txt", "r") as file:
    BASE_PROMPT = file.read()

def is_installed(lib_name):
    return shutil.which(lib_name) is not None

async def text_chunker(chunks):
    """Split text into chunks, ensuring to not break sentences."""
    splitters = (".", ",", "?", "!", ";", ":", "—", "-", "(", ")", "[", "]", "}", " ")
    buffer = ""

    async for text in chunks:
        if not text:
            continue
        if buffer.endswith(splitters):
            yield buffer + " "
            buffer = text
        elif text.startswith(splitters):
            yield buffer + text[0] + " "
            buffer = text[1:]
        else:
            buffer += text

    if buffer:
        yield buffer + " "

async def stream(audio_stream):
    """Stream audio data using mpv player."""
    if not is_installed("mpv"):
        raise ValueError(
            "mpv not found, necessary to stream audio. "
            "Install instructions: https://mpv.io/installation/"
        )

    mpv_process = subprocess.Popen(
        ["mpv", "--no-cache", "--no-terminal", "--", "fd://0"],
        stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )

    print("Started streaming audio")
    async for chunk in audio_stream:
        if chunk:
            mpv_process.stdin.write(chunk)
            mpv_process.stdin.flush()

    if mpv_process.stdin:
        mpv_process.stdin.close()
    mpv_process.wait()

async def text_to_speech_input_streaming(voice_id, text):
    """Send text to ElevenLabs API and stream the returned audio."""
    uri = f"wss://api.elevenlabs.io/v1/text-to-speech/{voice_id}/stream-input?model_id=eleven_monolingual_v1"

    data = []

    async with websockets.connect(uri) as websocket:
        await websocket.send(json.dumps({
            "text": " ",
            "voice_settings": {"stability": 0.5, "similarity_boost": 0.75},
            "xi_api_key": ELEVENLABS_API_KEY,
        }))

        async def listen():
            """Listen to the websocket for audio data and collect it."""
            while True:
                try:
                    message = await websocket.recv()
                    data.append(json.loads(message))
                    if data[-1].get('isFinal'):
                        break
                except websockets.exceptions.ConnectionClosed:
                    print("Connection closed")
                    break
                    

        listen_task = asyncio.create_task(listen())

        await websocket.send(json.dumps({"text": text, "try_trigger_generation": True}))

        await websocket.send(json.dumps({"text": ""}))

        await listen_task
    
    return data
        


def chat_completion(query):
    """Retrieve text from OpenAI and pass it to the text-to-speech function."""
    response = openai.chat.completions.create(
        model='gpt-3.5-turbo-0125',
        messages=[
        {
            "role": "system",
            "content": "tell me a story"
        },
        {
            "role": "user",
            "content": query
        }
        ],
        max_tokens=1000,
        temperature=0.6,
    )

    text = response.choices[0].message.content

    loop = asyncio.new_event_loop()
    result = loop.run_until_complete(text_to_speech_input_streaming(VOICE_ID, text))

    return result



app = Flask(__name__)

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json['message']
    result = chat_completion(user_message)
    print(result)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)