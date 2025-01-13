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
} from "../utils/firebase_api";
import { User } from "firebase/auth";
import { useEffect, useMemo, useState } from "react";

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
}) => {
  const compiledAdventure = useMemo(() => {
    return {
      messages,
      plotEssentials,
      aiInstructions,
      summary,
      title: adventureTitle,
      characters: characters,
    };
  }, [
    adventureTitle,
    aiInstructions,
    summary,
    characters,
    plotEssentials,
    messages,
  ]);

  const [adventureList, setAdventureList] = useState<Adventure[]>([]);

  async function doGetAdventureList() {
    const list = await getAdventures(user.uid);
    setAdventureList(list);
    if (list.length && list[0].id) setActiveAdventure(list[0]);
  }
  async function doCreateAdventure() {
    const emptyAdventure: Adventure = {
      messages: [],
      title: "",
      plotEssentials: "",
      aiInstructions: process.env.NEXT_PUBLIC_STORY_PROMPT!,
      summary: "",
      characters: [],
    };
    const id = await createAdventure(user.uid, emptyAdventure);
    setActiveAdventure(emptyAdventure);
    setAdventureId(id);
    doGetAdventureList();
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
      setPlotEssentials(objAdventure.plotEssentials);
      setMessages(objAdventure.messages);
      setCharacters(objAdventure.characters);
    }
  }

  useEffect(() => {
    doGetAdventureList();
  }, []);

  return (
    <div
      className={`fixed inset-0 bg-gray-900/95 transition-transform duration-300 ease-in-out h-screen ${
        isSettingsOpen ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="container mx-auto p-4 h-full flex flex-col">
        <Tabs defaultValue="general" className="flex-grow flex flex-col h-full">
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
              className="mb-4 overflow-scroll resize-none"
              disabled={!adventureList.length}
            />
            <Textarea
              placeholder="AI Instructions"
              value={aiInstructions}
              onChange={(e) => setAiInstructions(e.target.value)}
              className="mb-4 flex-grow overflow-scroll resize-none"
              disabled={!adventureList.length}
            />
            <Textarea
              placeholder="Story Summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="mb-4 flex-grow overflow-scroll resize-none"
              disabled={!adventureList.length}
            />
            <Textarea
              placeholder="Plot Essentials"
              value={plotEssentials}
              onChange={(e) => {
                setPlotEssentials(e.target.value);
              }}
              className="mb-4 flex-grow overflow-scroll resize-none"
              disabled={!adventureList.length}
            />
            <select
              value={adventureId || ""}
              onChange={(e) => setActiveAdventure(e.target.value)}
              className="mb-4 bg-gray-700 text-gray-100 rounded-md p-2"
              style={{ marginLeft: 2, marginRight: 2 }}
              disabled={!adventureList.length}
            >
              {adventureList.map((adventure) => (
                <option key={adventure.id} value={adventure.id}>
                  {(adventure.id === adventureId
                    ? adventureTitle
                    : adventure.title) || "[No Title Set]"}
                </option>
              ))}
            </select>
            {/* <Button
              onClick={() => {
                localStorage.clear();
                setMessages([]);
                setPlotEssentials("");
                setAiInstructions(process.env.NEXT_PUBLIC_STORY_PROMPT!);
                setSummary("");
              }}
              className="bg-red-600 text-white font-semibold px-4 py-2 rounded-md shadow-md 
             hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 
             focus:ring-offset-2 active:bg-red-800 transition duration-200"
            >
              Clear Adventure
            </Button> */}
            <Button
              onClick={doCreateAdventure}
              className="bg-green-600 text-white font-semibold px-4 py-2 rounded-md shadow-md 
             hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 
             focus:ring-offset-2 active:bg-green-800 transition duration-200 mt-2"
              style={{ marginLeft: 2, marginRight: 2 }}
            >
              Create New Adventure
            </Button>
            <SignOut setUser={setUser} />
          </TabsContent>
          <TabsContent value="characters" className="flex-grow overflow-auto">
            <CharacterSettings
              characters={characters}
              setCharacters={setCharacters}
              messages={messages}
              summary={summary}
              adventureId={adventureId!}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPanel;
