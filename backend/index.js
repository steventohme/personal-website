import OpenAI from "openai";
dotenv.config();

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
const voiceID = process.env.VOICE_ID;

