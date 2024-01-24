import OpenAI from "openai";
import { promises} from "fs";
dotenv.config();

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
const voiceID = process.env.VOICE_ID;

const app = express();
app.use(express.json());
app.use(cors());
const port = 8000;

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
