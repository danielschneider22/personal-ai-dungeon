"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Settings } from "lucide-react";
import InputBox from "./components/InputBox";
import MessageList from "./components/MessageList";
import SettingsPanel from "./components/SettingsPanel";
import { Character, Message } from "./components/types";
import { getImage } from "./utils/api";

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

const RPGConversation: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [adventureTitle, setAdventureTitle] = useState<string>("");
  const [aiInstructions, setAiInstructions] = useState<string>("");
  const [storySummary, setStorySummary] = useState<string>("");
  const [plotEssentials, setPlotEssentials] = useState<string>("");
  const [adventures] = useState<string[]>([
    "Current Adventure",
    "New Adventure 1",
    "New Adventure 2",
  ]);
  const [selectedAdventure, setSelectedAdventure] =
    useState<string>("Current Adventure");
  const [characters] = useState<Character[]>(initialCharacters);
  const [isInputVisible, setIsInputVisible] = useState<boolean>(false);
  const [showImages, setShowImages] = useState<boolean>(true);
  const [userMsgCnt, setUserMsgCnt] = useState<number>(0);

  const getImageOfEvents = async (id: string | number) => {
    const curatedMessages = messages.map((message) => ({
      role: message.sender,
      content: message.text,
    }));
    const json = {
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
        if (msgToAddImg) {
          msgToAddImg.image = imgStr;
          msgToAddImg.caption = aiReply.split("|||")[1];
        }
        return [...prev];
      });
      console.log(aiReply);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (
      messages.length &&
      messages.slice(-1)[0].sender === "assistant" &&
      !messages.slice(-1)[0].image &&
      !isLoading
    ) {
      getImageOfEvents(messages.slice(-1)[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, isLoading]);

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

    const curatedMessages = messages.map((message) => ({
      role: message.sender,
      content: message.text,
    }));
    const json = {
      model: "mistral-large-latest",
      messages: [
        {
          role: "system",
          content: process.env.NEXT_PUBLIC_STORY_PROMPT,
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
    console.log("Continue the adventure...");
  };

  const handleRetry = () => {
    console.log("Retrying the last action...");
  };

  const handleUndo = () => {
    console.log("Undoing the last action...");
    setMessages((prev) => prev.slice(0, -2));
  };

  const handleRedrawImage = () => {
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
      <MessageList
        messages={messages}
        showImages={showImages}
        isLoading={isLoading}
      />
      <InputBox
        input={input}
        setInput={setInput}
        isInputVisible={isInputVisible}
        toggleInput={toggleInput}
        handleSubmit={handleSubmit}
        handleContinue={handleContinue}
        handleRetry={handleRetry}
        handleUndo={handleUndo}
        handleRedrawImage={handleRedrawImage}
      />
      <SettingsPanel
        isSettingsOpen={isSettingsOpen}
        toggleSettings={toggleSettings}
        adventureTitle={adventureTitle}
        setAdventureTitle={setAdventureTitle}
        aiInstructions={aiInstructions}
        setAiInstructions={setAiInstructions}
        storySummary={storySummary}
        setStorySummary={setStorySummary}
        plotEssentials={plotEssentials}
        setPlotEssentials={setPlotEssentials}
        adventures={adventures}
        selectedAdventure={selectedAdventure}
        setSelectedAdventure={setSelectedAdventure}
        characters={characters}
      />
    </div>
  );
};

export default RPGConversation;
