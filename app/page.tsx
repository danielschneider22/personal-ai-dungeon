"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Settings } from "lucide-react";
import InputBox from "./components/InputBox";
import MessageList from "./components/MessageList";
import SettingsPanel from "./components/SettingsPanel";
import { Character, Message } from "./components/types";
import { getImage, getImageOfEvents } from "./utils/api";

const RPGConversation: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [adventureTitle, setAdventureTitle] = useState<string>("");
  const [aiInstructions, setAiInstructions] = useState<string>(
    process.env.NEXT_PUBLIC_STORY_PROMPT!
  );
  const [plotEssentials, setPlotEssentials] = useState<string>("");
  const [adventures] = useState<string[]>([
    "Current Adventure",
    "New Adventure 1",
    "New Adventure 2",
  ]);
  const [selectedAdventure, setSelectedAdventure] =
    useState<string>("Current Adventure");
  const [isInputVisible, setIsInputVisible] = useState<boolean>(false);
  const [showImages, setShowImages] = useState<boolean>(true);
  const [summary, setSummary] = useState("");

  useEffect(() => {
    const localInstructions = localStorage.getItem("aiInstructions");
    if (localInstructions) setAiInstructions(JSON.parse(localInstructions));
    const localMessages = localStorage.getItem("messages");
    if (localMessages) setMessages(JSON.parse(localMessages));
    const localSummary = localStorage.getItem("summary");
    if (localSummary) setSummary(localSummary);
    const localPlotEssentials = localStorage.getItem("plotEssentials");
    if (localPlotEssentials) setPlotEssentials(localPlotEssentials);
  }, []);

  // useEffect(() => {
  //   localStorage.setItem("messages", JSON.stringify(messages));
  // }, [messages]);

  useEffect(() => {
    localStorage.setItem("summary", summary);
  }, [summary]);

  useEffect(() => {
    if (
      messages.length &&
      messages.slice(-1)[0].sender === "assistant" &&
      !messages.slice(-1)[0].image &&
      !isLoading
    ) {
      async function makeImage() {
        const id = messages.slice(-1)[0].id;
        const aiReply = await getImageOfEvents(id, messages, characters);
        const imgStr = await getImage(aiReply.split("|||")[0]);
        setMessages((prev) => {
          const msgToAddImg = prev.find((message) => message.id === id);
          if (msgToAddImg) {
            msgToAddImg.image = imgStr;
            msgToAddImg.caption = aiReply.split("|||")[1];
          }
          return [...prev];
        });
      }

      makeImage();
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (
      messages.filter(
        (message) => message.sender === "user" && !message.summarized
      ).length >= 5 &&
      !isLoading
    ) {
      handleSummarize();
    }
  }, [messages]);

  const handleSubmit = async (input: string, newMessages?: Message[]) => {
    if (!input.trim()) return;

    const myMessages = newMessages || messages;

    const newPlayerMessage: Message = {
      id: myMessages.length + 1,
      text: input,
      sender: "user",
    };

    setMessages((prev) => [...prev, newPlayerMessage]);
    setIsLoading(true);
    setMessages((prev) => [...prev, { sender: "assistant", text: "", id: -1 }]);
    setIsInputVisible(false);

    const curatedMessages = myMessages
      .filter((message) => !message.summarized)
      .map((message) => ({
        role: message.sender,
        content: message.text,
      }));

    const json = {
      model: "mistral-large-latest",
      messages: [
        {
          role: "system",
          content: aiInstructions,
        },
        {
          role: "system",
          content: `Starting story context: ${plotEssentials}"`,
        },
        ...(summary
          ? [
              {
                role: "system",
                content:
                  "Summary of the events that have happened so far: " + summary,
              },
            ]
          : []),
        ...(characters
          ? [
              {
                role: "system",
                content:
                  "JSON object representing characters in the story" +
                  JSON.stringify(
                    characters.map((character) => {
                      return {
                        name: character.name,
                        appearance: character.appearance,
                        sLevel: character.meterDesc,
                      };
                    })
                  ),
              },
            ]
          : []),
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
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  async function handleSummarize() {
    const nonSummarizedMessages = messages
      .filter((message) => !message.summarized)
      .map((message) => ({
        role: message.sender,
        content: message.text,
      }));
    const json = {
      model: "mistral-large-latest",
      messages: [
        {
          role: "system",
          content: aiInstructions,
        },
        ...(summary
          ? [
              {
                role: "system",
                content:
                  "Summary of the events that have happened so far: " + summary,
              },
            ]
          : []),
        ...nonSummarizedMessages,
        {
          role: "user",
          content:
            "The previous message interactions between the assistant the user need to be added to the summary. Change the current summary to include the last series of events. These messages will no longer be included to you, we will just be passing the summary. Be sure to note important all important details. Start with **SUMMARY:** and then **CURRENT SCENE**. Keep track of any statistic changes for characters.",
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

      setMessages((prev) => {
        return prev.map((message) => {
          return {
            ...message,
            summarized: true,
          };
        });
      });
      setSummary(aiReply);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleContinue = () => {
    handleSubmit("Continue the story...");
  };

  const handleRetry = () => {
    const text = messages[messages.length - 2].text;
    const newMessages = messages.slice(0, messages.length - 2);
    setMessages(newMessages);
    handleSubmit(text, newMessages);
  };

  const handleUndo = () => {
    setMessages((prev) => prev.slice(0, -2));
  };

  const handleRedrawImage = () => {
    setMessages([
      ...messages.slice(0, messages.length - 1),
      { ...messages[messages.length - 1], image: undefined },
    ]);
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
      <div className="fixed top-2 right-2 z-50 flex items-center space-x-2">
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
        isInputVisible={isInputVisible}
        toggleInput={toggleInput}
        handleSubmit={handleSubmit}
        handleContinue={handleContinue}
        handleRetry={handleRetry}
        handleUndo={handleUndo}
        handleRedrawImage={handleRedrawImage}
        messages={messages}
      />
      <SettingsPanel
        isSettingsOpen={isSettingsOpen}
        toggleSettings={toggleSettings}
        adventureTitle={adventureTitle}
        setAdventureTitle={setAdventureTitle}
        aiInstructions={aiInstructions}
        setAiInstructions={setAiInstructions}
        summary={summary}
        setSummary={setSummary}
        plotEssentials={plotEssentials}
        setPlotEssentials={setPlotEssentials}
        adventures={adventures}
        selectedAdventure={selectedAdventure}
        setSelectedAdventure={setSelectedAdventure}
        messages={messages}
        characters={characters}
        setCharacters={setCharacters}
      />
    </div>
  );
};

export default RPGConversation;
