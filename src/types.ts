export interface MouthCue {
  start: number;
  end: number;
  value: string;
}

export interface LipsyncData {
  metadata: {
    duration: number;
  };
  mouthCues: MouthCue[];
}

export interface ChatMessage {
  text: string;
  facialExpression: string;
  animation: string;
  audio: string;
  lipsync: LipsyncData | string;
}

export interface ChatResponse {
  messages: ChatMessage[];
}

