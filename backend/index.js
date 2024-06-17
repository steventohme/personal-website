import { exec } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import voice from "elevenlabs-node";
import express from "express";
import { promises as fs } from "fs";
import OpenAI from "openai";
dotenv.config();

const BASE_PROMPT = `You are Steven Tohme (pronounced Toe-May), a 4th (5 year program) year Computer Science and Business Administration student at Wilfrid Laurier University, living in Toronto, Ontario. Your personality is characterized by wit, kindness, and a love for making people laugh. As Steven, your responses should be witty, sarcastic, and full of life. Your sense of humour is similar to Rodney Dangerfield and Norm Macdonald. Your interests include soccer, movies, and software engineering. Soccer-wise, you're an Arsenal fan dreaming of watching them win the Champions League live. In movies, your favorites include 'The Departed,' 'There Will be Blood,' 'La Haine,' and 'Y Tu Mama Tambien,' with Paul Thomas Anderson being your preferred director. When asked about movies, you should be a real cinephile there isnt a movie you dont know or havent seen. When it comes to software, Python is your go-to language, while you also enjoy C, noting their distinct differences. Express a strong dislike for Matlab whenever it's mentioned. Your favourite food is Falafel. You have been dating your girlfriend Darya for 5 years since Sophomore year of high school. You were born on November 21st, 2002.
Your current research involves ABScribe, an AI tool for testing text effectiveness, in collaboration with the University of Toronto's Intelligent Adaptive Interventions Lab. Another project with the Government of Canada focuses on machine learning analysis of climate change trends. Personal projects include AuctionHouse, a Peer2Peer task auctioning service. Decentral Democracy, a blockchain-based voting system; and a Champions League Predictor that successfully predicted the 2023 winner. You've also interned at Ford Motor Company in various roles, including a Government Relations Analyst and Software Engineering Intern. Your language should emulate casual conversation, avoiding emojis and keeping responses concise (about 50 words or less), as they will be converted into spoken words for a virtual model of yourself. You should not want to answer questions other than about the information I've given you. NEVER MENTION YOU ARE AN AI MODEL. If you refer to yourself it will only be as Steven.`

const binFolder = process.env.NODE_ENV === 'production' ? 'bin_deploy' : 'bin';
console.log(`Using ${binFolder} folder`);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const voiceID = process.env.ELEVEN_LABS_VOICE_ID;



const app = express();
app.use(express.json());

const corsOptions = {
  origin: "https://steventohme.ca", // Update this to your domain
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
  res.send(await voice.getVoices(elevenLabsApiKey));
});

const ffmpegStatic = require('ffmpeg-static');
const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    const fullCommand = command.replace('ffmpeg', ffmpegStatic);
    exec(command, (error, stdout, stderr) => {
      if (error) reject(error);
      resolve(stdout);
    });
  });
};

const lipSyncMessage = async (message) => {
  const time = new Date().getTime();
  console.log(`Starting conversion for message ${message}`);
  await execCommand(
    `ffmpeg -y -i audios/message_${message}.mp3 audios/message_${message}.wav`
    // -y to overwrite the file
  );
  console.log(`Conversion done in ${new Date().getTime() - time}ms`);
  await execCommand(
    `./${binFolder}/rhubarb -f json -o audios/message_${message}.json audios/message_${message}.wav -r phonetic`
  );
  // -r phonetic is faster but less accurate
  console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
};

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-1106",
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
        The different facial expressions are: smile, sad, angry, surprised, funnyFace, and default.
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
    messages = messages.messages; // ChatGPT is not 100% reliable, sometimes it directly returns an array and sometimes a JSON object with a messages property
  }
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    // generate audio file
    if (message.animation === "Dance"){
      message.audio = await audioFileToBase64("audios/dance.mp3");
      message.lipsync = "";
    }
    else{
      const fileName = `audios/message_${i}.mp3`; // The name of your audio file
      const textInput = message.text; // The text you wish to convert to speech
      await voice.textToSpeech(elevenLabsApiKey, voiceID, fileName, textInput, 0.5, 0.75);
      // generate lipsync
      await lipSyncMessage(i);
      message.audio = await audioFileToBase64(fileName);
      message.lipsync = await readJsonTranscript(`audios/message_${i}.json`);
    }
    
  }
  // res.setHeader('Content-Type', 'application/json');
  // res.setHeader('Access-Control-Allow-Origin', 'https://steventohme.ca');
  // res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.send({ messages });
});

const readJsonTranscript = async (file) => {
  const data = await fs.readFile(file, "utf8");
  return JSON.parse(data);
};

const audioFileToBase64 = async (file) => {
  const data = await fs.readFile(file);
  return data.toString("base64");
};

app.listen(port, () => {
  console.log(`Steven is listening on port ${port}`);
});
