# Steven Tohme - Personal Website

Interactive 3D avatar website with AI-powered chat using OpenAI and ElevenLabs for voice synthesis.

## Tech Stack

- **Frontend**: React, Three.js, React Three Fiber, TypeScript
- **Backend**: Vercel Serverless Functions
- **AI**: OpenAI GPT-4, ElevenLabs Text-to-Speech
- **Styling**: Tailwind CSS

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Environment Variables

Create a `.env` file with:

```
OPENAI_API_KEY=your_openai_api_key
ELEVEN_LABS_API_KEY=your_elevenlabs_api_key
ELEVEN_LABS_VOICE_ID=your_voice_id
```

## Deployment

Deploy to Vercel:

```bash
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

## Project Structure

```
├── api/              # Vercel serverless functions
│   └── chat.ts       # Chat endpoint with OpenAI & ElevenLabs
├── src/              # React frontend
│   ├── components/   # React components (Avatar, Experience, UI)
│   ├── hooks/        # Custom hooks (useChat)
│   └── types.ts      # TypeScript types
├── public/           # Static assets
│   └── models/       # 3D models (.glb)
└── data/             # API data files
```
