"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import {
  RefreshCw,
  PaintbrushIcon as PaintBrush,
  Settings,
  ChevronDown,
  Undo,
  X,
  Eye,
  EyeOff,
} from "lucide-react";

interface Message {
  id: string | number;
  text: string;
  sender: "user" | "assistant";
  image?: string;
  caption?: string;
}

interface Character {
  id: number;
  name: string;
  image: string;
  description: string;
  meter: number;
  traits: string[];
}

async function getImage(prompt: string) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    prompt: prompt,
    negative_prompt:
      "score_6, score_5, score_4, pony, gaping, censored, furry, child, kid, chibi, 3d, photo, monochrome, elven ears, anime, multiple cocks, extra legs, extra hands, mutated legs, mutated hands, big man, high man, muscular man, muscular hands",
    width: 832,
    height: 1216,
    samples: 1,
    steps: 30,
    cfg_scale: 7,
    sampler: "Euler a",
    schedule_type: "Automatic",
    model_hash: "059934ff58",
    model: "ponyRealism_V21MainVAE.safetensors [059934ff58]",
    clip_skip: 2,
  });

  const requestOptions: any = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  return fetch("http://127.0.0.1:7860/sdapi/v1/txt2img", requestOptions)
    .then((response) => response.json())
    .then((result) => result.images[0])
    .catch((error) => error);
}

const initialMessages: Message[] = [];

const initialCharacters: Character[] = [
  {
    id: 1,
    name: "Elara the Elven Archer",
    image: "/placeholder.svg?height=100&width=100",
    description: "A skilled archer with a mysterious past.",
    meter: 75,
    traits: ["Agile", "Sharp-eyed", "Secretive"],
  },
  {
    id: 2,
    name: "Grimlock the Dwarven Warrior",
    image: "/placeholder.svg?height=100&width=100",
    description: "A stout-hearted warrior with an unbreakable will.",
    meter: 90,
    traits: ["Strong", "Loyal", "Stubborn"],
  },
  {
    id: 3,
    name: "Zephyr the Wind Mage",
    image: "/placeholder.svg?height=100&width=100",
    description: "A capricious spellcaster with the power of the winds.",
    meter: 60,
    traits: ["Intelligent", "Unpredictable", "Free-spirited"],
  },
  {
    id: 4,
    name: "Thorne the Rogue",
    image: "/placeholder.svg?height=100&width=100",
    description: "A cunning thief with a heart of gold.",
    meter: 40,
    traits: ["Stealthy", "Charming", "Greedy"],
  },
  {
    id: 5,
    name: "Luna the Druid",
    image: "/placeholder.svg?height=100&width=100",
    description: "A wise shapeshifter in tune with nature.",
    meter: 85,
    traits: ["Wise", "Calm", "Protective"],
  },
];

export default function RPGConversation() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [adventureTitle, setAdventureTitle] = useState("");
  const [aiInstructions, setAiInstructions] = useState("");
  const [storySummary, setStorySummary] = useState("");
  const [plotEssentials, setPlotEssentials] = useState("");
  const [adventures, setAdventures] = useState([
    "Current Adventure",
    "New Adventure 1",
    "New Adventure 2",
  ]);
  const [selectedAdventure, setSelectedAdventure] =
    useState("Current Adventure");
  const [characters, setCharacters] = useState<Character[]>(initialCharacters);
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [showImages, setShowImages] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [userMsgCnt, setUserMsgCnt] = useState(0);
  useEffect(() => {
    if (
      messages.length &&
      messages.slice(-1)[0].sender === "assistant" &&
      !messages.slice(-1)[0].image &&
      !isLoading
    ) {
      getImageOfEvents(messages.slice(-1)[0].id);
    }
  }, [messages, isLoading]);

  const getImageOfEvents = async (id: string | number) => {
    const curatedMessages: any = [];
    messages.forEach((message, i) => {
      curatedMessages.push({ role: message.sender, content: message.text });
    });
    const json: any = {
      model: "mistral-large-latest",
      messages: [
        {
          role: "system",
          content: process.env.NEXT_PUBLIC_IMAGE_SYSTEM_TEXT,
        },

        ...curatedMessages,
        {
          role: "user",
          content: `For this response, return a list of strings used to create a stable diffusion prompt of the current person in the scene and their action. The will be used to generate an image for the narrative
            
            return the comma separated string followed by exactly three pipes ||| then give a descriptor of the name of who is in the scene and what they are doing
            example:
            ${process.env.NEXT_PUBLIC_IMAGE_EXAMPLE_TEXT}
            `,
        },
      ],
    };
    try {
      const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_MISTRAL_API_TOKEN}`,
        },
        body: JSON.stringify(json),
      });
      const data = await res.json();
      const aiReply = data.choices[0].message.content;

      const imgStr = await getImage(aiReply.split("|||")[0]);
      setMessages((prev) => {
        const msgToAddImg = prev.find((message) => message.id === id);
        msgToAddImg!.image = imgStr;
        msgToAddImg!.caption = aiReply.split("|||")[1];
        return [...prev];
      });
      console.log(aiReply);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (scrollAreaRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
        setScrollPosition(scrollTop / (scrollHeight - clientHeight));
      }
    };

    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      scrollArea.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (scrollArea) {
        scrollArea.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current && isInputVisible) {
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        5 * 24
      )}px`;
    }
  }, [input, isInputVisible]);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    const newPlayerMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: "user",
    };

    setMessages((prev) => [...prev, newPlayerMessage]);
    setInput("");
    setIsLoading(true);
    setMessages((prev) => [...prev, { sender: "assistant", text: "", id: -1 }]);
    setIsInputVisible(false);

    const curatedMessages: any = [];
    messages.forEach((message) => {
      curatedMessages.push({ role: message.sender, content: message.text });
    });
    const json: any = {
      model: "mistral-large-latest",
      messages: [
        {
          role: "system",
          content:
            'You\'re a storyteller and game-master that provides any sort of game, roleplaying and story content. This game is meant to be erotic and simulates a dnd like game. Your first priority is to provide erotic situations to the player tailored to their events, interactions, and desires. Keep track of stats and leveling up. The expectation is the prompts are attempting to create erotic scenarios. Write in second person present tense ("You are"), unless otherwise indicated. Continue the story where it leaves off without repetition. Continue any unfinished sentences. Write plainly and simply. Use everyday words with their literal meanings. Be specific and concrete. Use colloquial dialog. Keep the story moving. > means an attempted action. Create realistic outcomes and consequences.',
        },
        ...curatedMessages,
        {
          role: "user",
          content: input,
        },
      ],
    };
    try {
      const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_MISTRAL_API_TOKEN}`,
        },
        body: JSON.stringify(json),
      });
      const data = await res.json();
      const aiReply = data.choices[0].message.content;

      setMessages((prev) => [
        ...prev.slice(0, -1),
        { sender: "assistant", text: aiReply, id: data.id },
      ]);
      setUserMsgCnt(userMsgCnt + 1);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    // Implement continue logic
    console.log("Continue the adventure...");
  };

  const handleRetry = () => {
    // Implement retry logic
    console.log("Retrying the last action...");
  };

  const handleUndo = () => {
    // Implement undo logic
    console.log("Undoing the last action...");
    setMessages((prev) => prev.slice(0, -2));
  };

  const handleRedrawImage = () => {
    // Implement redraw image logic
    console.log("Redrawing the last image...");
    getImageOfEvents(messages.slice(-1)[0].id);
  };

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const toggleInput = () => {
    setIsInputVisible(!isInputVisible);
  };

  const toggleImages = () => {
    setShowImages(!showImages);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 font-serif relative">
      <div
        className="fixed top-2 right-2 z-50 flex items-center space-x-2"
        style={{ opacity: 0.5 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleImages}
          className="rounded-full p-1 hover:bg-gray-700"
        >
          {showImages ? (
            <Eye className="h-6 w-6" />
          ) : (
            <EyeOff className="h-6 w-6" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSettings}
          className="rounded-full p-1 hover:bg-gray-700"
        >
          <Settings className="h-6 w-6" />
        </Button>
      </div>
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-start" : "justify-end"
              }`}
              style={{
                opacity: Math.max(
                  0.3,
                  1 -
                    (scrollPosition * (messages.length - index)) /
                      messages.length
                ),
              }}
            >
              <div
                className={`max-w-[90%] p-3 rounded-lg ${
                  message.sender === "user" ? "bg-blue-600" : "bg-gray-800"
                }`}
              >
                {message.sender === "assistant" &&
                isLoading &&
                index === messages.length - 1 ? (
                  <div className="loading-bubble">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                ) : (
                  <p className="typewriter" style={{ whiteSpace: "pre-line" }}>
                    {message.text}
                  </p>
                )}
                {message.image && showImages && (
                  <div className="mt-2">
                    <Image
                      src={`data:image/png;base64,${message.image}`}
                      alt={message.caption || "AI-generated image"}
                      width={400}
                      height={300}
                      className="rounded-lg"
                    />
                    {message.caption && (
                      <p className="mt-1 text-sm text-gray-300 italic">
                        {message.caption}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="bg-gray-800 relative">
        <div className="max-w-2xl mx-auto">
          <div className="flex">
            <div
              className={`flex-grow transition-all duration-300 ease-in-out bg-gray-900 ${
                isInputVisible
                  ? "opacity-100 max-w-full"
                  : "opacity-0 max-w-0 overflow-hidden"
              }`}
            >
              <Textarea
                ref={textareaRef}
                placeholder="What will you do next?"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full bg-gray-700 text-gray-100 overflow-y-auto"
                style={!isInputVisible ? { display: "none" } : {}}
              />
            </div>
            <div
              className={`flex bg-gray-900 transition-all duration-300 ease-in-out ${
                isInputVisible ? "flex-shrink-0" : "flex-grow w-full"
              }`}
            >
              <Button
                type="submit"
                className={`transition-all duration-300 ease-in-out ${
                  isInputVisible ? "flex-shrink-0" : "flex-grow"
                }`}
                onClick={() => {
                  if (isInputVisible) {
                    handleSubmit();
                  }
                  toggleInput();
                }}
              >
                Take a turn
              </Button>
              <Button
                onClick={handleContinue}
                variant="outline"
                className={`bg-gray-700 text-gray-100 hover:bg-gray-600 transition-all duration-300 ease-in-out ${
                  isInputVisible
                    ? "w-0 p-0 m-0 border-transparent overflow-hidden"
                    : "flex-grow"
                }`}
              >
                Continue
              </Button>
              <Button
                onClick={handleRetry}
                variant="ghost"
                size="icon"
                className={`transition-all duration-300 ease-in-out ${
                  isInputVisible
                    ? "w-0 p-0 m-0 border-transparent overflow-hidden"
                    : "flex-grow"
                }`}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleUndo}
                variant="ghost"
                size="icon"
                className={`transition-all duration-300 ease-in-out ${
                  isInputVisible
                    ? "w-0 p-0 m-0 border-transparent overflow-hidden"
                    : "flex-grow"
                }`}
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleRedrawImage}
                variant="ghost"
                size="icon"
                className={`transition-all duration-300 ease-in-out ${
                  isInputVisible
                    ? "w-0 p-0 m-0 border-transparent overflow-hidden"
                    : "flex-grow"
                }`}
              >
                <PaintBrush className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        {isInputVisible && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleInput}
            className="absolute -top-3 right-2 rounded-full p-1 hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div
        className={`fixed inset-0 bg-gray-900/95 transition-transform duration-300 ease-in-out ${
          isSettingsOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="container mx-auto p-4 h-full flex flex-col">
          <Tabs defaultValue="general" className="flex-grow flex flex-col">
            <div className="flex justify-center w-full mb-4">
              <TabsList className="bg-transparent">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="characters">Characters</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent
              value="general"
              className="flex-grow flex flex-col overflow-auto"
            >
              <Input
                type="text"
                placeholder="Adventure Title"
                value={adventureTitle}
                onChange={(e) => setAdventureTitle(e.target.value)}
                className="mb-4"
              />
              <Textarea
                placeholder="AI Instructions"
                value={aiInstructions}
                onChange={(e) => setAiInstructions(e.target.value)}
                className="mb-4 flex-grow"
              />
              <Textarea
                placeholder="Story Summary"
                value={storySummary}
                onChange={(e) => setStorySummary(e.target.value)}
                className="mb-4 flex-grow"
              />
              <Textarea
                placeholder="Plot Essentials"
                value={plotEssentials}
                onChange={(e) => setPlotEssentials(e.target.value)}
                className="mb-4 flex-grow"
              />
              <select
                value={selectedAdventure}
                onChange={(e) => setSelectedAdventure(e.target.value)}
                className="mb-4 bg-gray-700 text-gray-100 rounded-md p-2"
              >
                {adventures.map((adventure) => (
                  <option key={adventure} value={adventure}>
                    {adventure}
                  </option>
                ))}
              </select>
            </TabsContent>
            <TabsContent value="characters" className="flex-grow overflow-auto">
              <ScrollArea className="h-full">
                {characters.map((character) => (
                  <div
                    key={character.id}
                    className="mb-6 p-4 bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center mb-4">
                      <Image
                        src={character.image}
                        alt={character.name}
                        width={50}
                        height={50}
                        className="rounded-full mr-4"
                      />
                      <h3 className="text-xl font-bold">{character.name}</h3>
                    </div>
                    <p className="mb-2">{character.description}</p>
                    <div className="mb-2">
                      <div className="bg-gray-700 h-2 rounded-full">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${character.meter}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{character.meter}/100</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Traits:</h4>
                      <ul className="list-disc list-inside">
                        {character.traits.map((trait, index) => (
                          <li key={index}>{trait}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
