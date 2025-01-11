import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CharacterSettings from "./CharacterSettings";
import { Character, Message } from "./types";
import { Button } from "@/components/ui/button";

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
  selectedAdventure: string;
  setSelectedAdventure: (adventure: string) => void;
  messages: Message[];
  characters: Character[];
  setCharacters: any;
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
  adventures,
  selectedAdventure,
  setSelectedAdventure,
  messages,
  characters,
  setCharacters,
}) => {
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
            />
            <Textarea
              placeholder="AI Instructions"
              value={aiInstructions}
              onChange={(e) => setAiInstructions(e.target.value)}
              className="mb-4 flex-grow overflow-scroll resize-none"
            />
            <Textarea
              placeholder="Story Summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="mb-4 flex-grow overflow-scroll resize-none"
            />
            <Textarea
              placeholder="Plot Essentials"
              value={plotEssentials}
              onChange={(e) => {
                localStorage.setItem("plotEssentials", e.target.value);
                setPlotEssentials(e.target.value);
              }}
              className="mb-4 flex-grow overflow-scroll resize-none"
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
            <Button
              onClick={() => localStorage.clear()}
              className="bg-red-600 text-white font-semibold px-4 py-2 rounded-md shadow-md 
             hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 
             focus:ring-offset-2 active:bg-red-800 transition duration-200"
            >
              Clear Adventure
            </Button>
          </TabsContent>
          <TabsContent value="characters" className="flex-grow overflow-auto">
            <CharacterSettings
              characters={characters}
              setCharacters={setCharacters}
              messages={messages}
              summary={summary}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPanel;
