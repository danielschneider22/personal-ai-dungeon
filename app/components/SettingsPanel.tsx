import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CharacterSettings from "./CharacterSettings";
import { Character, Message } from "./types";

import { saveAdventure } from "../utils/firebase_api";
import { User } from "firebase/auth";
import { useEffect, useMemo } from "react";
import { AdminArea } from "./AdminArea";
import { Summaries } from "./Summaries";
import { GeneralContent } from "./GeneralContent";

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
  summaryList: string[];
  setSummaryList: any;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isSettingsOpen,
  adventureTitle,
  setAdventureTitle,
  aiInstructions,
  setAiInstructions,
  summary,
  summaryList,
  setSummaryList,
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
  const compiledAdventure = useMemo(() => {
    return {
      messages,
      plotEssentials,
      aiInstructions,
      summary,
      summaryList,
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
    summaryList,
  ]);

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
              <TabsTrigger value="summaries">Summaries</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="general" className="flex-grow overflow-auto">
            <GeneralContent
              adventureTitle={adventureTitle}
              setAdventureTitle={setAdventureTitle}
              aiInstructions={aiInstructions}
              setAiInstructions={setAiInstructions}
              summary={summary}
              setSummary={setSummary}
              plotEssentials={plotEssentials}
              setPlotEssentials={setPlotEssentials}
              messages={messages}
              setCharacters={setCharacters}
              setMessages={setMessages}
              setUser={setUser}
              user={user}
              adventureId={adventureId}
              setAdventureId={setAdventureId}
              summarizePrompt={summarizePrompt!}
              setSummarizePrompt={setSummarizePrompt}
              summaryList={summaryList}
              setSummaryList={setSummaryList}
            />
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
          <TabsContent
            value="summaries"
            className="flex-grow flex flex-col overflow-visible"
          >
            <Summaries summaryList={summaryList} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPanel;
