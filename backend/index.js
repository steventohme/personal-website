import { exec } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import { ElevenLabsClient } from "elevenlabs";
import express from "express";
import { promises as fs } from "fs";
import OpenAI from "openai";
dotenv.config();

const BASE_PROMPT = await fs.readFile('prompt.txt', 'utf-8');

const env = process.env.NODE_ENV || "development";
const binFolder = env === 'production' ? 'bin_deploy' : 'bin';
console.log(`Using ${binFolder} folder`);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const voiceID = process.env.ELEVEN_LABS_VOICE_ID;

const client = new ElevenLabsClient({ apiKey: elevenLabsApiKey});

const app = express();
app.use(express.json());

const corsOptions = {
  origin: env === 'development' ? "http://localhost:5173" : "https://steventohme.ca",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/voices", async (req, res) => {
  const voices = await elevenLabsClient.voices.list();
  res.send(voices);
});

function convertAlignmentToMouthCues(alignment) {
  // Use normalized alignment values.
  const totalDuration = alignment.character_end_times_seconds[alignment.character_end_times_seconds.length - 1];
  const sampleInterval = 0.05; // sample every 50ms
  let cues = [];
  let currentTime = 0;
  let currentValue = null;
  let groupStart = 0;
  
  while (currentTime <= totalDuration) {
    // Find the character covering currentTime.
    // (Assumes alignment arrays are sorted in time.)
    let index = alignment.character_start_times_seconds.findIndex(
      (start, i) => start <= currentTime && alignment.character_end_times_seconds[i] >= currentTime
    );
    if (index === -1) {
      index = alignment.characters.length - 1;
    }
    let mapped = mapCharToMouthCue(alignment.characters[index]);
    if (currentValue === null) {
      currentValue = mapped;
      groupStart = currentTime;
    } else if (mapped !== currentValue) {
      cues.push({ start: groupStart, end: currentTime, value: currentValue });
      currentValue = mapped;
      groupStart = currentTime;
    }
    currentTime += sampleInterval;
  }
  // Add the final group.
  cues.push({ start: groupStart, end: totalDuration, value: currentValue });
  
  // Ensure first cue starts at 0 and last cue ends at totalDuration.
  if (cues.length > 0) {
    cues[0].start = 0;
    cues[cues.length - 1].end = totalDuration;
  }
  
  // Merge cues that are too short (less than 40ms) with the previous cue.
  const minDuration = 0.04;
  let merged = [];
  for (const cue of cues) {
    if (merged.length > 0 && (cue.end - cue.start) < minDuration) {
      // Extend the previous cue's end time.
      merged[merged.length - 1].end = cue.end;
    } else {
      merged.push(cue);
    }
  }
  
  return {
    metadata: {
      // You might optionally include a soundFile property if needed.
      duration: totalDuration
    },
    mouthCues: merged
  };
}

function mapCharToMouthCue(char) {
  if (char.trim() === '') {
    return 'X'; // Idle position for spaces/pauses.
  }
  const c = char.toUpperCase();
  if (['P', 'B', 'M'].includes(c)) return 'A';
  // You can adjust these rules based on your phonetic expectations.
  if (['A'].includes(c)) return 'D'; // wide open (AA)
  if (['O'].includes(c)) return 'E'; // rounded (AO/ER)
  if (['W'].includes(c)) return 'F'; // puckered for W sounds
  if (['F', 'V'].includes(c)) return 'G';
  if (['L'].includes(c)) return 'H';
  // For vowels that might be pronounced like "I" or "E",
  // you may want a slightly open mouth:
  if (['E', 'I'].includes(c)) return 'C';
  // Otherwise, default most consonants to "B"
  return 'B';
}


app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    max_tokens: 1000,
    temperature: 0.6,
    response_format: {
      type: "json_object",
    },
    messages: [
      {
        role: "system",
        content: `
        ${BASE_PROMPT}
        You will always reply with a JSON array of messages. With a maximum of 3 messages.
        Each message has a text, facialExpression, and animation property.
        The different facial expressions are: smile, sad, angry, surprised, and default.
        The different animations are: Laughing, Laughing_Hard, Idle, Dance, Slanted_Stance, Talking_Explanation, Talking_Explanation2, and Yelling. 
        `,
      },
      {
        role: "user",
        content: userMessage || "Hello",
      },
    ],
  });
  let messages = JSON.parse(completion.choices[0].message.content);
  if (messages.messages) {
    messages = messages.messages;
  }
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];

    if (message.animation === "Dance"){
      message.audio = await fs.readFile('audios/dance.txt', 'base64');
      message.lipsync = "";
    }
    else{
      const textInput = message.text;

      const startTime = Date.now();
      const result = await client.textToSpeech.convertWithTimestamps(voiceID, {
        text: message.text,
        model_id: "eleven_flash_v2"
      });
      const elapsedTime = Date.now() - startTime;
      console.log(`Text to speech conversion took ${elapsedTime}ms`);

      message.audio = result.audio_base64;
      message.lipsync = convertAlignmentToMouthCues(result.alignment);
    }
    
  }
  res.send({ messages });
});

app.listen(port, () => {
  console.log(`Steven is listening on port ${port}`);
});
