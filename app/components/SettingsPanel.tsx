import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Character } from "./types";
import CharacterCard from "./CharacterCard";

interface SettingsPanelProps {
  isSettingsOpen: boolean;
  toggleSettings: () => void;
  adventureTitle: string;
  setAdventureTitle: (title: string) => void;
  aiInstructions: string;
  setAiInstructions: (instructions: string) => void;
  storySummary: string;
  setStorySummary: (summary: string) => void;
  plotEssentials: string;
  setPlotEssentials: (essentials: string) => void;
  adventures: string[];
  selectedAdventure: string;
  setSelectedAdventure: (adventure: string) => void;
  characters: Character[];
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isSettingsOpen,
  adventureTitle,
  setAdventureTitle,
  aiInstructions,
  setAiInstructions,
  storySummary,
  setStorySummary,
  plotEssentials,
  setPlotEssentials,
  adventures,
  selectedAdventure,
  setSelectedAdventure,
  characters,
}) => {
  return (
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
                <CharacterCard key={character.id} character={character} />
              ))}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPanel;
