import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CharacterSettings from "./CharacterSettings";
import { Adventure, Character, Message } from "./types";
import { Button } from "@/components/ui/button";
import SignOut from "./SignOut";
import {
  createAdventure,
  getAdventures,
  saveAdventure,
  deleteAdventure,
} from "../utils/firebase_api";
import { User } from "firebase/auth";
import { useEffect, useMemo, useState } from "react";
import { Expand } from "lucide-react";
import { NUM_SUMMARIZE_MESSAGES } from "@/lib/consts";
import { AdminArea } from "./AdminArea";
import { useAdmin } from "../utils/adminContext";

interface SettingsPanelProps {
  isSettingsOpen: boolean;
  toggleSettings: () => void;
  adventureTitle: string;
  setAdventureTitle: (title: string) => void;
  aiInstructions: string;
  setAiInstructions: (instructions: string) => void;
  summary: string;
  setSummary: (summary: string) => void;
  plotEssentials: string;
  setPlotEssentials: (essentials: string) => void;
  adventures: string[];
  messages: Message[];
  characters: Character[];
  setCharacters: any;
  setMessages: any;
  setUser: any;
  user: User;
  adventureId: string | null;
  setAdventureId: any;
  summarizePrompt: string;
  setSummarizePrompt: any;
  showImages: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isSettingsOpen,
  adventureTitle,
  setAdventureTitle,
  aiInstructions,
  setAiInstructions,
  summary,
  setSummary,
  plotEssentials,
  setPlotEssentials,
  messages,
  characters,
  setCharacters,
  setUser,
  user,
  setMessages,
  adventureId,
  setAdventureId,
  summarizePrompt,
  setSummarizePrompt,
  showImages,
}) => {
  const { isAdmin } = useAdmin();

  const compiledAdventure = useMemo(() => {
    return {
      messages,
      plotEssentials,
      aiInstructions,
      summary,
      title: adventureTitle,
      characters: characters,
      summarizePrompt,
    };
  }, [
    adventureTitle,
    aiInstructions,
    summary,
    characters,
    plotEssentials,
    messages,
  ]);

  const emptyAdventure: Adventure = {
    messages: [],
    title: "",
    plotEssentials: "",
    aiInstructions: isAdmin
      ? process.env.NEXT_PUBLIC_STORY_PROMPT!
      : process.env.NEXT_PUBLIC_STORY_PROMPT_PC!,
    summary: "",
    characters: [],
    summarizePrompt: isAdmin
      ? process.env.NEXT_PUBLIC_SUMMARIZE_PROMPT!
      : process.env.NEXT_PUBLIC_SUMMARIZE_PROMPT_PC!,
  };

  const [adventureList, setAdventureList] = useState<Adventure[]>([]);
  const [activeTextArea, setActiveTextArea] = useState<string | null>(null);

  async function doGetAdventureList() {
    const list = await getAdventures(user.uid);
    setAdventureList(list);
    if (list.length && list[0].id) setActiveAdventure(list[0]);
  }
  async function doCreateAdventure() {
    const id = await createAdventure(user.uid, { ...emptyAdventure });
    setActiveAdventure({ ...emptyAdventure });
    setAdventureId(id);
    doGetAdventureList();
  }

  async function doMegaSummarize() {
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
        {
          role: "user",
          content: `The previous system message is a summary of the events of the story so far, but is currently too long and contains unnecessary information. Summarize the summary, keeping only the important aspects of the plot and depictions of characters and their actions. If the story is divided into chapters, try and summarize the individual chapters. Keep the framework of the summary the same though. `,
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

      setSummary(aiReply);
    } catch (error) {
      console.error(error);
    }
  }
  async function doDeleteAdventure() {
    const userConfirmed = window.confirm(
      "Are you sure you want to delete this adventure? This action cannot be undone!"
    );
    if (userConfirmed) {
      await deleteAdventure(user.uid, adventureId!);
      setActiveAdventure({ ...emptyAdventure });
      setAdventureId(null);
      doGetAdventureList();
    }
  }

  useEffect(() => {
    if (adventureTitle && adventureId) {
      saveAdventure(adventureId, user.uid, compiledAdventure);
    }
  }, [
    adventureTitle,
    aiInstructions,
    summary,
    characters,
    plotEssentials,
    messages,
    adventureId,
    summarizePrompt,
  ]);

  function setActiveAdventure(adventure: string | Adventure) {
    // @ts-expect-error because I said so
    let objAdventure: Adventure | undefined = adventure;
    if (typeof adventure === "string") {
      objAdventure = adventureList.find((a) => a.id === adventure);
    }
    if (objAdventure) {
      setAdventureId(objAdventure.id!);
      setAdventureTitle(objAdventure.title);
      setAiInstructions(objAdventure.aiInstructions);
      setSummary(objAdventure.summary);
      setSummarizePrompt(
        objAdventure.summarizePrompt ||
          (isAdmin
            ? process.env.NEXT_PUBLIC_SUMMARIZE_PROMPT
            : process.env.NEXT_PUBLIC_SUMMARIZE_PROMPT_PC)
      );
      setPlotEssentials(objAdventure.plotEssentials);
      setMessages(objAdventure.messages);
      setCharacters(objAdventure.characters);
    }
  }

  useEffect(() => {
    doGetAdventureList();
  }, []);

  const disallowChange =
    messages.filter(
      (message) => message.sender === "user" && !message.summarized
    ).length >= NUM_SUMMARIZE_MESSAGES && !!messages[messages.length - 1].text;

  const disabledFields = !adventureList.length || disallowChange;

  return (
    <div
      className={`fixed inset-0 bg-gray-900/95 transition-transform duration-300 ease-in-out h-screen ${
        isSettingsOpen ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="container mx-auto p-4 h-full flex flex-col">
        <Tabs defaultValue="general" className="flex-grow flex flex-col h-full">
          <div className="flex justify-center w-full mb-1">
            <TabsList className="bg-transparent">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="characters">Characters</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent
            value="general"
            className="flex-grow flex flex-col overflow-visible"
          >
            <Input
              type="text"
              placeholder="Adventure Title"
              value={adventureTitle}
              onChange={(e) => setAdventureTitle(e.target.value)}
              className="mb-4 overflow-scroll"
              disabled={disabledFields}
            />
            <div
              className={`mb-4 flex-grow relative ${
                activeTextArea === "aiInstructions" ? "h-[90%]" : "h-auto"
              } overflow-visible`}
            >
              <Textarea
                placeholder="AI Instructions"
                value={aiInstructions}
                onChange={(e) => setAiInstructions(e.target.value)}
                className="h-full overflow-scroll"
                disabled={disabledFields}
              />
              <Button
                className="absolute right-1 -top-1.5 w-5 h-5 bg-green-600 text-white font-semibold rounded-md shadow-md 
                opacity-50 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 
                focus:ring-offset-2 active:bg-green-800 transition duration-200 mt-2"
                onClick={() => setActiveTextArea("aiInstructions")}
              >
                <Expand />
              </Button>
            </div>

            <div
              className={`mb-4 flex-grow relative ${
                activeTextArea === "summarizePrompt" ? "h-[90%]" : "h-auto"
              } overflow-visible`}
            >
              <Textarea
                placeholder="AI summarize instructions"
                value={summarizePrompt}
                onChange={(e) => setSummarizePrompt(e.target.value)}
                className="h-full overflow-scroll"
                disabled={disabledFields}
              />
              <Button
                className="absolute right-1 -top-1.5 w-5 h-5 bg-green-600 text-white font-semibold rounded-md shadow-md 
                opacity-50 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 
                focus:ring-offset-2 active:bg-green-800 transition duration-200 mt-2"
                onClick={() => setActiveTextArea("summarizePrompt")}
              >
                <Expand />
              </Button>
            </div>
            <div
              className={`mb-4 flex-grow relative ${
                activeTextArea === "storySummary" ? "h-[90%]" : "h-auto"
              } overflow-visible`}
            >
              <Textarea
                placeholder="Story Summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="h-full overflow-scroll"
                disabled={disabledFields}
              />
              <Button
                className="absolute right-1 -top-1.5 w-5 h-5 bg-green-600 text-white font-semibold rounded-md shadow-md 
                opacity-50 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 
                focus:ring-offset-2 active:bg-green-800 transition duration-200 mt-2"
                onClick={() => setActiveTextArea("storySummary")}
              >
                <Expand />
              </Button>
            </div>
            <div
              className={`mb-4 flex-grow relative ${
                activeTextArea === "plotEssentials" ? "h-[90%]" : "h-auto"
              } overflow-visible`}
            >
              <Textarea
                placeholder="Plot Essentials"
                value={plotEssentials}
                onChange={(e) => {
                  setPlotEssentials(e.target.value);
                }}
                className="h-full overflow-scroll"
                disabled={disabledFields}
              />
              <Button
                className="absolute right-1 -top-1.5 w-5 h-5 bg-green-600 text-white font-semibold rounded-md shadow-md 
                opacity-50 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 
                focus:ring-offset-2 active:bg-green-800 transition duration-200 mt-2"
                onClick={() => setActiveTextArea("plotEssentials")}
              >
                <Expand />
              </Button>
            </div>
            <select
              value={adventureId || ""}
              onChange={(e) => setActiveAdventure(e.target.value)}
              className="mb-4 bg-gray-700 text-gray-100 rounded-md p-2"
              style={{ marginLeft: 2, marginRight: 2 }}
              disabled={disabledFields}
            >
              {adventureList &&
                adventureList.map((adventure) => (
                  <option
                    key={adventure.title + adventure.id}
                    value={adventure.id}
                  >
                    {(adventure.id === adventureId
                      ? adventureTitle
                      : adventure.title) || "[No Title Set]"}
                  </option>
                ))}
            </select>
            <div className="flex w-full justify-center">
              <Button
                onClick={doCreateAdventure}
                className="bg-green-600 text-white font-semibold px-4 py-2 rounded-md shadow-md 
             hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 
             focus:ring-offset-2 active:bg-green-800 transition duration-200 mt-2"
                style={{ marginLeft: 2, marginRight: 2 }}
              >
                Create New
              </Button>
              <SignOut setUser={setUser} />
              <Button
                onClick={doMegaSummarize}
                className="bg-yellow-600 text-white font-semibold px-4 py-2 rounded-md shadow-md 
             hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 
             focus:ring-offset-2 active:bg-yellow-800 transition duration-200 mt-2"
                style={{ marginLeft: 2, marginRight: 2 }}
              >
                Summary
              </Button>
              <Button
                onClick={doDeleteAdventure}
                className="bg-red-600 text-white font-semibold px-4 py-2 rounded-md shadow-md 
             hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 
             focus:ring-offset-2 active:bg-red-800 transition duration-200 mt-2"
                style={{ marginLeft: 2, marginRight: 2 }}
              >
                Delete
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="characters" className="flex-grow overflow-auto">
            <CharacterSettings
              characters={characters}
              setCharacters={setCharacters}
              messages={messages}
              summary={summary}
              adventureId={adventureId!}
              showImages={showImages}
            />
          </TabsContent>
          <TabsContent
            value="admin"
            className="flex-grow flex flex-col overflow-visible"
          >
            <AdminArea />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPanel;
