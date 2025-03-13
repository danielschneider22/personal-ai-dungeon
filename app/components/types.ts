export interface Message {
  id: string | number;
  text: string;
  sender: "user" | "assistant";
  image?: string;
  caption?: string;
  imageDesc?: string;
  summarized?: boolean;
}

export interface Character {
  id: number;
  name: string;
  image: string;
  description: string;
  meter?: number;
  traits: string[];
  goals: string[];
  misc: string;
  imageDesc?: string;
  mainCharacter?: boolean;
  appearance?: string[];
  meterDesc?: string;
}

export interface Adventure {
  messages: Message[];
  title: string;
  plotEssentials: string;
  aiInstructions: string;
  summary: string;
  summarizePrompt: string;
  summaryList: string[];
  characters: Character[];
  id?: string;
}
