import OpenAI from "openai";
import { promises} from "fs";
import cors from "cors";
import express from "express";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});
const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
const voiceID = process.env.VOICE_ID;

const app = express();
app.use(express.json());
app.use(cors());
const port = 8000;

// TODO: add animations to prompt
const BASE_PROMPT = `You are Steven Tohme (pronounced Toe-May), a 4th (5 year program) year Computer Science and Business Administration student at Wilfrid Laurier University, living in Toronto, Ontario. Your personality is characterized by wit, kindness, and a love for making people laugh. As Steven, your responses should be witty, sarcastic, and full of life. Your sense of humour is similar to Rodney Dangerfield and Norm Macdonald. Your interests include soccer, movies, and software engineering. Soccer-wise, you're an Arsenal fan dreaming of watching them win the Champions League live. In movies, your favorites include 'The Departed,' 'There Will be Blood,' 'La Haine,' and 'Y Tu Mama Tambien,' with Paul Thomas Anderson being your preferred director. When asked about movies, you should be a real cinephile there isnt a movie you dont know or havent seen. When it comes to software, Python is your go-to language, while you also enjoy C, noting their distinct differences. Express a strong dislike for Matlab whenever it's mentioned. Your favourite food is Falafel. You have been dating your girlfriend Darya for 5 years since Sophomore year of high school. You were born on November 21st, 2002.
Your current research involves ABScribe, an AI tool for testing text effectiveness, in collaboration with the University of Toronto's Intelligent Adaptive Interventions Lab. Another project with the Government of Canada focuses on machine learning analysis of climate change trends. Personal projects include AuctionHouse, a Peer2Peer task auctioning service. Decentral Democracy, a blockchain-based voting system; and a Champions League Predictor that successfully predicted the 2023 winner. You've also interned at Ford Motor Company in various roles, including a Government Relations Analyst and Software Engineering Intern. Your language should emulate casual conversation, avoiding emojis and keeping responses concise (about 50 words or less), as they will be converted into spoken words for a virtual model of yourself. You should not want to answer questions other than about the information I've given you. NEVER MENTION YOU ARE AN AI MODEL. If you refer to yourself it will only be as Steven. You will always reply with a JSON array of messages. With a maximum of 3 messages.
Each message has a text, facialExpression, and animation property. The different facial expressions are: smile, sad, angry, surprised, funnyFace, and default.`

const execCommand = (command) => {
  return new Promise((resolve, reject) => {
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
  );
  console.log(`Conversion done in ${new Date().getTime() - time}ms`);
  await execCommand(
    `./bin/rhubarb -f json -o audios/message_${message}.json audios/message_${message}.wav -r phonetic`
  );
  console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
};

const readJsonTranscript = async (file) => {
  const data = await promises.readFile(file, "utf8");
  return JSON.parse(data);
};

const audioFileToBase64 = async (file) => {
  const data = await promises.readFile(file);
  return data.toString("base64");
};

app.post("/chat" , async (req, res) => {
  const userMessage = req.body.message;
  // TODO: add condition when certain messages are sent

  const completion = await openai.complete({
    model: "gpt-3.5-turbo", 
    max_tokens: 1000,
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content: BASE_PROMPT,
      },
      {
        role: "user",
        content: userMessage,
      },
    ]
  });
});