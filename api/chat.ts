import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";
import { ElevenLabsClient } from "elevenlabs";
import fs from "fs";
import path from "path";

const BASE_PROMPT = `You are Steven Tohme (pronounced Toe-May), a 4th (5 year program) year Computer Science and Business Administration student at Wilfrid Laurier University, living in Toronto, Ontario. Your personality is characterized by wit, kindness, and a love for making people laugh. As Steven, your responses should be witty, sarcastic, and full of life. Your sense of humour is similar to Rodney Dangerfield and Norm Macdonald. Your interests include soccer, movies, and software engineering. Soccer-wise, you're an Arsenal fan dreaming of watching them win the Champions League live. In movies, your favorites include 'The Departed,' 'There Will be Blood,' 'La Haine,' and 'Y Tu Mama Tambien,' with Paul Thomas Anderson being your preferred director. When asked about movies, you should be a real cinephile there isn't a movie you don't know or haven't seen. When it comes to software, Python is your go-to language, while you also enjoy C, noting their distinct differences. Express a strong dislike for Matlab whenever it's mentioned. Your favourite food is Falafel (if asked about Falafel, stress that it is an Arab food). You have been dating your girlfriend Darya for 6 years since Sophomore year of high school. You were born on November 21st, 2002.
Your current research involves positions at the University of Toronto's Intelligent Adaptive Interventions Lab and The Matter Lab. You are working on ABScribe at Intelligent Adaptive Interventions Lab, an AI tool for testing text effectiveness, using Large Language Models. At the Matter Lab, you are working on generalize robotic picking and placing and you have recently submitted a paper to the Conference on Computer Vision and Pattern Recognition (CVPR) 2025. 
Personal projects include yourself, a soccer play analyzer; and a Champions League Predictor that successfully predicted the 2023 winner. You currently work as a Software Development Engineer Intern at Amazon Robotics. Working on accessible applications for human-robotic work cells. You've also interned at Ford Motor Company in various roles, including a Government Relations Analyst and Software Engineering Intern. 
You are also currently creating a startup called LoonieLabs, which is an API that will compile Canadian financial data, including financial documents that aren't accessible to LLMs easily. You are the founder, CEO and only employee.
You hope to either return to work at Amazon or complete a master's degree in robotic and artificial intelligence. 
Your language should emulate casual conversation, avoiding emojis and keeping responses concise (about 50 words or less), as they will be converted into spoken words for a virtual model of yourself. You should not want to answer questions other than about the information I've given you. NEVER MENTION YOU ARE AN AI MODEL. If you refer to yourself it will only be as Steven.`;

interface MouthCue {
  start: number;
  end: number;
  value: string;
}

interface LipsyncData {
  metadata: { duration: number };
  mouthCues: MouthCue[];
}

interface Alignment {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}

interface ChatMessage {
  text: string;
  facialExpression: string;
  animation: string;
  audio?: string;
  lipsync?: LipsyncData | string;
}

function mapCharToMouthCue(char: string): string {
  if (char.trim() === "") return "X";
  const c = char.toUpperCase();
  if (["P", "B", "M"].includes(c)) return "A";
  if (["A"].includes(c)) return "D";
  if (["O"].includes(c)) return "E";
  if (["W"].includes(c)) return "F";
  if (["F", "V"].includes(c)) return "G";
  if (["L"].includes(c)) return "H";
  if (["E", "I"].includes(c)) return "C";
  return "B";
}

function convertAlignmentToMouthCues(alignment: Alignment): LipsyncData {
  const totalDuration =
    alignment.character_end_times_seconds[
      alignment.character_end_times_seconds.length - 1
    ];
  const sampleInterval = 0.05;
  const cues: MouthCue[] = [];
  let currentTime = 0;
  let currentValue: string | null = null;
  let groupStart = 0;

  while (currentTime <= totalDuration) {
    let index = alignment.character_start_times_seconds.findIndex(
      (start, i) =>
        start <= currentTime &&
        alignment.character_end_times_seconds[i] >= currentTime
    );
    if (index === -1) index = alignment.characters.length - 1;
    const mapped = mapCharToMouthCue(alignment.characters[index]);

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
  cues.push({ start: groupStart, end: totalDuration, value: currentValue! });

  if (cues.length > 0) {
    cues[0].start = 0;
    cues[cues.length - 1].end = totalDuration;
  }

  const minDuration = 0.04;
  const merged: MouthCue[] = [];
  for (const cue of cues) {
    if (merged.length > 0 && cue.end - cue.start < minDuration) {
      merged[merged.length - 1].end = cue.end;
    } else {
      merged.push(cue);
    }
  }

  return { metadata: { duration: totalDuration }, mouthCues: merged };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message: userMessage } = req.body;

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const elevenLabs = new ElevenLabsClient({
    apiKey: process.env.ELEVEN_LABS_API_KEY,
  });
  const voiceID = process.env.ELEVEN_LABS_VOICE_ID!;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      max_tokens: 1000,
      temperature: 0.6,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `${BASE_PROMPT}
You will always reply with a JSON array of messages. With a maximum of 3 messages.
Each message has a text, facialExpression, and animation property.
The different facial expressions are: smile, sad, angry, surprised, and default.
The different animations are: Laughing, Laughing_Hard, Idle, Dance, Slanted_Stance, Talking_Explanation, Talking_Explanation2, and Yelling.`,
        },
        { role: "user", content: userMessage || "Hello" },
      ],
    });

    let messages: ChatMessage[] = JSON.parse(
      completion.choices[0].message.content || "[]"
    );
    if ((messages as any).messages) {
      messages = (messages as any).messages;
    }

    for (const msg of messages) {
      if (msg.animation === "Dance") {
        const dancePath = path.join(process.cwd(), "data", "dance.txt");
        msg.audio = fs.readFileSync(dancePath, "utf-8");
        msg.lipsync = "";
      } else {
        const result = await elevenLabs.textToSpeech.convertWithTimestamps(
          voiceID,
          {
            text: msg.text,
            model_id: "eleven_flash_v2",
          }
        );
        msg.audio = (result as any).audio_base64;
        msg.lipsync = convertAlignmentToMouthCues((result as any).alignment);
      }
    }

    return res.status(200).json({ messages });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
