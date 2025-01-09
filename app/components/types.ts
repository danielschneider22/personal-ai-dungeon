export interface Message {
  id: string | number;
  text: string;
  sender: "user" | "assistant";
  image?: string;
  caption?: string;
}

export interface Character {
  id: number;
  name: string;
  image: string;
  description: string;
  meter: number;
  traits: string[];
}
