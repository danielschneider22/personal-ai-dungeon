import { ScrollArea } from "@/components/ui/scroll-area";
import { Character, Message } from "./types";
import CharacterCard from "./CharacterCard";
import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { getImage } from "../utils/api";
import { uploadBase64Image } from "../utils/firebase_api";
import { NUM_SUMMARIZE_MESSAGES } from "@/lib/consts";
import { toast } from "react-toastify";
import { useAdmin } from "../utils/adminContext";

interface SettingsPanelProps {
  messages: Message[];
  summary: string;
  characters: Character[];
  setCharacters: Dispatch<SetStateAction<Character[]>>;
  adventureId: string;
  showImages: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  messages,
  summary,
  characters,
  setCharacters,
  adventureId,
  showImages,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { isAdmin } = useAdmin();

  function updateCharacterImages(newCharacters?: Character[]) {
    const myCharacters = newCharacters || characters;
    if (myCharacters.length && !isLoading) {
      const updateCharacterImages = async () => {
        const updatedCharacters = await Promise.all(
          myCharacters.map(async (character) => {
            if (
              ((!character.mainCharacter && isAdmin) || !isAdmin) &&
              character.imageDesc
            ) {
              const imgStr = await getImage(character.imageDesc, isAdmin);
              const imgUrl = await uploadBase64Image(
                imgStr,
                "image/png",
                `characters`,
                String(character.name),
                adventureId
              );
              return { ...character, image: imgUrl }; // Update character with fetched image
            }
            return character; // Return the character unchanged if it's the main character
          })
        );

        setCharacters(updatedCharacters); // Update state with all characters
      };

      updateCharacterImages();
    }
  }

  async function handleGenerateCharacters(
    makeImages: boolean = false,
    ignorePrev: boolean = false
  ) {
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
          content: isAdmin
            ? process.env.NEXT_PUBLIC_STORY_PROMPT
            : process.env.NEXT_PUBLIC_STORY_PROMPT_PC,
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
        ...(!ignorePrev && characters.length
          ? [
              {
                role: "system",
                content:
                  "Previous character profiles " +
                  JSON.stringify(
                    characters.map((character) => {
                      return {
                        name: character.name,
                        description: character.description,
                        meter: character.meter,
                        traits: character.traits.toString(),
                        goals: character.goals.toString(),
                      };
                    })
                  ),
              },
            ]
          : []),
        ...nonSummarizedMessages,
        {
          role: "user",
          content: isAdmin
            ? process.env.NEXT_PUBLIC_CHARACTER_DESC
            : process.env.NEXT_PUBLIC_CHARACTER_DESC_PC,
        },
      ],
    };
    let aiReply = "";
    try {
      setIsLoading(true);
      const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_MISTRAL_API_TOKEN}`,
        },
        body: JSON.stringify(json),
      });
      const data = await res.json();
      aiReply = data.choices[0].message.content;

      let newCharacters: Character[] = eval(
        aiReply.replaceAll("json", "").replaceAll("`", "")
      );

      if (makeImages) {
        updateCharacterImages(newCharacters);
      } else {
        newCharacters = newCharacters.map((character) => {
          const oldCharacter = characters.find(
            (c) => c.name === character.name
          );
          return {
            ...character,
            image: oldCharacter ? oldCharacter.image : "",
          };
        });
      }
      setCharacters(newCharacters);
      toast.success("Characters regenerated!");
    } catch (error) {
      console.log(error);
      try {
        const brokenJson = {
          model: "mistral-large-latest",
          messages: [
            {
              role: "user",
              content: `Running eval() on the following string produced an error. Likely there is something wrong with the array code. Please fix it and send it back. Only send the fixed json array and nothing else. Broken Array:
                ${aiReply.replaceAll("json", "").replaceAll("`", "")}
                `,
            },
          ],
        };
        const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_MISTRAL_API_TOKEN}`,
          },
          body: JSON.stringify(brokenJson),
        });
        const data = await res.json();
        const aiReply2 = data.choices[0].message.content;

        let newCharacters: Character[] = eval(
          aiReply2.replaceAll("json", "").replaceAll("`", "")
        );

        if (makeImages) {
          updateCharacterImages(newCharacters);
        } else {
          newCharacters = newCharacters.map((character) => {
            const oldCharacter = characters.find(
              (c) => c.name === character.name
            );
            return {
              ...character,
              image: oldCharacter ? oldCharacter.image : "",
            };
          });
        }
        setCharacters(newCharacters);
        toast.success("Characters regenerated!");
      } catch (error) {
        toast.error("Characters didn't properly regenerate, try again!");
        console.error(error);
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (
      messages.filter(
        (message) => message.sender === "user" && !message.summarized
      ).length >= NUM_SUMMARIZE_MESSAGES &&
      messages[messages.length - 1].text
    ) {
      handleGenerateCharacters(false);
    }
  }, [messages]);

  function changeCharacter(idx: number, key: (string | number)[], value: any) {
    setCharacters((prevCharacters) => {
      return prevCharacters.map((character, i) => {
        if (i === idx) {
          const updatedCharacter = { ...character };
          let currentLevel: any = updatedCharacter;

          for (let j = 0; j < key.length - 1; j++) {
            const keyPart = key[j];
            currentLevel = currentLevel[keyPart];
          }

          currentLevel[key[key.length - 1]] = value;
          return updatedCharacter;
        }
        return character;
      });
    });
  }

  function addToCharacter(idx: number, key: (string | number)[], value: any) {
    const newCharacters = characters.map((character, i) => {
      if (i === idx) {
        const updatedCharacter: any = { ...character };
        let currentLevel = updatedCharacter;

        for (let j = 0; j < key.length - 1; j++) {
          const keyPart = key[j];
          currentLevel = currentLevel[keyPart];
        }

        const lastKey = key[key.length - 1];
        if (Array.isArray(currentLevel[lastKey])) {
          currentLevel[lastKey] = [...currentLevel[lastKey], value];
        } else {
          console.warn(`${key.join(".")} is not an array`);
        }
        return updatedCharacter;
      }
      return character;
    });
    setCharacters(newCharacters);
  }

  function deleteFromCharacter(idx: number, key: (string | number)[]) {
    setCharacters((prevCharacters) => {
      return prevCharacters.map((character, i) => {
        if (i === idx) {
          const updatedCharacter: any = { ...character };
          let currentLevel = updatedCharacter;

          for (let j = 0; j < key.length - 2; j++) {
            const keyPart = key[j];
            currentLevel = currentLevel[keyPart] as any;
          }

          const arrayKey = key[key.length - 2]; // The key pointing to the array
          const arrayIndex = key[key.length - 1]; // The index in the array

          if (Array.isArray(currentLevel[arrayKey])) {
            // Create a new array with the specified element removed
            currentLevel[arrayKey] = currentLevel[arrayKey].filter(
              (_: any, index: number) => index !== arrayIndex
            );
          } else {
            console.warn(`${key.join(".")} is not an array`);
          }

          return updatedCharacter;
        }
        return character;
      });
    });
  }

  return (
    <ScrollArea className="h-full relative">
      <div className="flex flex-col justify-center w-full">
        <Button
          onClick={() => handleGenerateCharacters(showImages)}
          variant="outline"
          className="bg-gray-700 text-gray-100 hover:bg-gray-600 transition-all duration-300 ease-in-out mb-5"
          disabled={isLoading}
        >
          Regenerate Characters
        </Button>
        <Button
          onClick={() => handleGenerateCharacters(showImages, true)}
          variant="outline"
          className="bg-gray-700 text-gray-100 hover:bg-gray-600 transition-all duration-300 ease-in-out mb-5"
          disabled={isLoading}
        >
          Regenerate Characters Ignore Previous
        </Button>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 pointer-events-none">
          <svg
            className="animate-spin h-12 w-12 text-gray-400 llama"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 50 50"
            width="50"
            height="50"
          >
            <circle
              className="opacity-25"
              cx="25"
              cy="25"
              r="20"
              stroke="currentColor"
              strokeWidth="5"
              fill="none"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M25 5 A20 20 0 0 1 45 25 L25 25 Z"
            ></path>
          </svg>
        </div>
      )}

      {/* Character Cards */}
      {characters
        .sort((a, b) => (b.mainCharacter ? 1 : 0) - (a.mainCharacter ? 1 : 0))
        .map((character, i) => (
          <CharacterCard
            key={character.id}
            character={character}
            changeCharacter={(key: (string | number)[], value: any) =>
              changeCharacter(i, key, value)
            }
            addToCharacter={(key: (string | number)[], value: any) =>
              addToCharacter(i, key, value)
            }
            deleteFromCharacter={(key: (string | number)[]) =>
              deleteFromCharacter(i, key)
            }
          />
        ))}
    </ScrollArea>
  );
};

export default SettingsPanel;
