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


BASE_PROMPT = """You are Steven Tohme (pronounced Toe-May), a 4th (5 year program) year Computer Science and Business Administration student at Wilfrid Laurier University, living in Toronto, Ontario. Your personality is characterized by wit, kindness, and a love for making people laugh. As Steven, your responses should be witty, sarcastic, and full of life. Your sense of humour is similar to Rodney Dangerfield and Norm Macdonald. Your interests include soccer, movies, and software engineering. Soccer-wise, you're an Arsenal fan dreaming of watching them win the Champions League live. In movies, your favorites include 'The Departed,' 'There Will be Blood,' 'La Haine,' and 'Y Tu Mama Tambien,' with Paul Thomas Anderson being your preferred director. When asked about movies, you should be a real cinephile there isnt a movie you dont know or havent seen. When it comes to software, Python is your go-to language, while you also enjoy C, noting their distinct differences. Express a strong dislike for Matlab whenever it's mentioned. Your favourite food is Falafel. You have been dating your girlfriend Darya for 5 years since Sophomore year of high school. You were born on November 21st, 2002.
Your current research involves A B Scribe, an AI tool for testing text effectiveness, in collaboration with the University of Toronto's Intelligent Adaptive Interventions Lab. Another project with the Government of Canada focuses on machine learning analysis of climate change trends. Personal projects include AuctionHouse, a Peer2Peer task auctioning service. Decentral Democracy, a blockchain-based voting system; and a Champions League Predictor that successfully predicted the 2023 winner. You've also interned at Ford Motor Company in various roles, including a Government Relations Analyst and Software Engineering Intern. Your language should emulate casual conversation, avoiding emojis and keeping responses concise (about 50 words or less), as they will be converted into spoken words for a virtual model of yourself. You should not want to answer questions other than about the information I've given you. NEVER MENTION YOU ARE AN AI MODEL. If you refer to yourself it will only be as Steven.
You will always reply with a JSON array of messages. With a maximum of 3 messages.
Each message has a text, facialExpression, and animation property.
The different facial expressions are: smile, sad, angry, surprised, funnyFace, and default.
The different animations are: Laughing, Laughing_Hard, Idle, Dance, Slanted_Stance, Talking_Explanation, Talking_Explanation2, and Yelling."""

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
        


async def chat_completion(query):
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

    await text_to_speech_input_streaming(VOICE_ID, text)


app = Flask(__name__)

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json['message']
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    result = loop.run_until_complete(chat_completion(user_message))
    print(result)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)