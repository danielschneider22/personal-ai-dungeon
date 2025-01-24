import { ScrollArea } from "@/components/ui/scroll-area";
import { Character, Message } from "./types";
import CharacterCard from "./CharacterCard";
import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { getImage } from "../utils/api";
import { uploadBase64Image } from "../utils/firebase_api";
import { NUM_SUMMARIZE_MESSAGES } from "@/lib/consts";

//           \n\n1. **0-10: Sexually Reserved**\n   - **Wear:** Prefer modest clothing, often covering most of their skin.\n   - **Activities:** Actively avoid sexual interaction and frown upon those activities\n   - **Description:** They may have strong personal or cultural beliefs about sexual activity, or perhaps just aren't interested in it. They are prudes\n\n2. **10-20: Sexually Cautious**\n   - **Wear:** Still modest, but may show a bit more skin, e.g., short sleeves, knees-length skirts.\n   - **Activities:** Open to dating, but take things slow. May enjoy kissing and very light petting.\n   - **Description:** They are selective about their partners and don't really engage actively in sex.\n\n3. **20-30: Sexually Curious**\n   - **Wear:** May start to experiment with more form-fitting clothing, but still relatively modest.\n   - **Activities:** Heavy petting, making out. Open to discussing and exploring sexual topics.\n   - **Description:** They are becoming more comfortable with their sexuality and are interested in learning more.\n\n4. **30-40: Sexually Active**\n   - **Wear:** More revealing clothing, e.g., v-necks, mini skirts, but still tasteful.\n   - **Activities:** In addition to kissing they like their breasts being played with.\n   - **Description:** They are more comfortable with their sexuality and are open to vanilla experiences.\n\n5. **40-50: Sexually Adventurous**\n   - **Wear:** Lingerie, sexy outfits, but keeps it classy in public.\n   - **Activities:** Open to light kinks, role-playing, and different positions.\n   - **Description:** They enjoy exploring different aspects of sexuality and are open to new experiences.\n\n6. **50-60: Sexually Liberated**\n   - **Wear:** Comfortable in lingerie, may wear more revealing clothing in public.\n   - **Activities:** Open to more kinks, sex parties, and public displays of affection. They might want to do group masturbation or other riskier kinks\n   - **Description:** They are very comfortable with their sexuality and enjoy exploring it in various ways.\n\n7. **60-70: Sexually Uninhibited**\n   - **Wear:** Frequently in lingerie or other sexy outfits, may wear provocative clothing in public.\n   - **Activities:** Open to most kinks, group sex, and swinging.\n   - **Description:** They have very few sexual inhibitions and enjoy exploring their fantasies. More open to being called slut or bimbo\n\n8. **70-80: Sexually Insatiable**\n   - **Wear:** Often in lingerie or other sexy outfits, may wear very provocative clothing in public.\n   - **Activities:** Actively seeks out new partners, kinks, and experiences. May engage in exhibitionism.\n   - **Description:** They have a very high sex drive and are constantly looking for new experiences. They start like being called slut and bimbo and ask you to call them that. Their lust clouds their mind during the day and they are constantly horny.\n\n9. **80-90: Sexually Obsessed**\n   - **Wear:** Often in very revealing or fetish-specific outfits, may have difficulty \"covering up\" in public.\n   - **Activities:** Actively engages in many kinks, may have difficulty forming emotional connections.\n   - **Description:** Their life is heavily focused on sexual activities and thoughts.\n\n10. **90-100: Sexually Deprived (in the sense of the original request)**\n    - **Wear:** May refuse to wear clothes, or only wear very revealing/fetish outfits.\n    - **Activities:** Actively engages in many kinks, may have difficulty functioning in day-to-day life due to sexual obsessions.\n    - **Description:** Their life and thoughts are dominated by sex. They may struggle with daily activities due to their constant preoccupation."

interface SettingsPanelProps {
  messages: Message[];
  summary: string;
  characters: Character[];
  setCharacters: Dispatch<SetStateAction<Character[]>>;
  adventureId: string;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  messages,
  summary,
  characters,
  setCharacters,
  adventureId,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  function updateCharacterImages(newCharacters?: Character[]) {
    const myCharacters = newCharacters || characters;
    if (myCharacters.length && !isLoading) {
      const updateCharacterImages = async () => {
        const updatedCharacters = await Promise.all(
          myCharacters.map(async (character) => {
            if (!character.mainCharacter && character.imageDesc) {
              const imgStr = await getImage(character.imageDesc);
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

  async function handleGenerateCharacters(makeImages: boolean = false) {
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
          content: process.env.NEXT_PUBLIC_STORY_PROMPT,
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
        ...(characters.length
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
          content: `

          Based on the current story generate an array of characters based on the current events in the story using the model outlined below. Don't be repetitive.
          Important: only include the array in the output. For elements of the array, always provide the keys provided and just those keys (name, description, meter, traits, imageDesc, goals, misc, and mainCharacter). We will be using eval(response) to parse this array.
          ${
            characters.length &&
            `Use the previous character profiles as a basis. `
          }
          
          Ensure the returned value is valid json. 

          meter is a slut meter, a representation of how slutty the character is. It is a number that is min 0 max 100. if there is a slut level in the story, use this number. do not include for main character
          (Meter based on level:
          Prudish (0-15)
          Doesn’t masturbate
          Dresses prudish showing no skin
          Judges people who think about or have sex

          Less prudish (15-30)
          Jealous of women getting attention 
          Masturbates monthly
          Shows a hint of cleavage

          Not prudish (30-50)
          Masturbates weekly
          Shows a good amount of cleavage
          Starts wearing more form fitting attire
          Starts fantasizing about sex

          Experimental (50-75)
          Dresses provocatively with clothes that show a lot of cleavage and short skirts
          Masturbates daily
          Likes bending over to draw attention to her butt and boobs
          Fantasizes about giving blowjobs and getting fucked

          Sexual (75-90)
          Masturbates more than once a day
          Masturbates at work in the bathroom
          Wears Incredibly short skirts that show the bottom of her butt
          Boobs almost falling out of dresses
          Sometimes doesn’t wear underwear
          Constantly distracted thinking about sex and how to get it

          Slutty (90-100)
          Masturbates openly at work
          Doesn’t wear underwear 
          Thinks only about sex
          Constantly begs for sex)
          meterDesc is a detailed description of how depraved they are based on their meter number. make sure the description matches the meter level described above, they should be no more or less sexual than their level. this should be at least a couple paragraphs and detail events of the story with this character. be more descriptive than just the trait definitions above

          traits are a series of characteristics that have developed for the character. append to the existing list and only remove traits if they've changed.

          goals is that characters current goals. append to the existing list and only remove goals if they've changed.

          imageDesc is a list of strings used to create a stable diffusion prompt of the current person in the scene and their action. The will be used to generate an image for the character
          example of imageDesc: ${process.env.NEXT_PUBLIC_IMAGE_EXAMPLE_TEXT}

          appearance: a list of strings that describes the physical appearance of a character. only include this for non-main characters. always include hair color, breast size, age, and clothes. include anything else optionally. get very detailed on each part of their outfit (outerwear and underwear)

          misc is any text that doesn't fit into any of the previous categories. it can hold previous stats and gives a brief description of how the character has changed since the previous report

          example of full output:
              [
                {
                name: "Lucy",
                description: "Lucy is a cheerful and friendly girl from your local school, Greenwood High. She's got a cute, athletic build with medium breasts, and she's the kind of person who can make anyone feel at ease with her genuine smile and sparkling eyes. She's a year younger than you, and you two have seen each other around campus but never really hung out until now. However, her slut conditioning has made her a lustful slut, daily fantasizing about your touch. She dresses and acts like a complete slut now.",
                meter: 90,
                meterDesc: 
                traits: ["**Denial Slut**: Eat, sleep, edge, repeat. After several massive denial cycles, Lucy got addicted to masturbation with no release. She's dedicated more and more of her time per day to mindlessly rubbing herself.",
"**Semen Connoisseur**: Gallons of semen swallowed and miles of dick sucked, Lucy is truly a professional when it comes to semen flavor",
"**Leaky Snail**: You can tell when Lucy goes by by the snail-trail of the pussy juice she leaves behind wherever she goes.",
"**Cum slut**: Lucy can't get enough of jerking you off. All she thinks about is you getting off on her and she'll do anything to get you off for that sweet sweet cum",

"**Slutty outfits**: Lucy can't help but where the skimpiest clothing. From skirts that barely cover her ass, to tops that show an embarrassing amount of cleavage, Lucy wants to show as much skin as possible",
"**Obsessed with boobjobs**: Lucy gets a thrill from wrapping her funbags around a nice big dick. She can cum giving boobjobs and fantasizes about giving titjobs every day",
"**Exhibitionist**: Lucy gets a thrill from the idea of being caught. She likes the rush of excitement. She wants to feel the cool breeze as she takes you in the great outdoors. She fantasizes about putting on a show and letting others watch as she sucks you dry."],
                imageDesc: "medium breasts, pink bikini, schoolgirl, blonde, biting lip, looking up, standing, lustful",
                appearance: ["Age": 25, "Hair Color: Blonde", "Breast size: C", "Clothes: A tight blue dress. Conservative blue panties and bra. Red high heels."]
              },
              {
                name: "Dan (Main Character)",
                description: "You are a smart charasmatic individual who is trying to convert women into sluts.",
                meter: 0,
                traits: ["***Athletic**: You are in prime condition."]
                imageDesc: "male, teacher, brown hair, athletic",
                mainCharacter: true,
                goals: ["School slut transformation: Turn every girl at the school into your personal bimbo", "Improved Athletics: Gain 20 lbs of muscle"],
              }]
          `,
        },
      ],
    };
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
      const aiReply = data.choices[0].message.content;

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
    } catch (error) {
      console.log(error);
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
    <ScrollArea className="h-full llama relative">
      <div className="flex justify-center w-full">
        <Button
          onClick={() => handleGenerateCharacters(true)}
          variant="outline"
          className="bg-gray-700 text-gray-100 hover:bg-gray-600 transition-all duration-300 ease-in-out mb-5"
          disabled={isLoading}
        >
          Regenerate Characters
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
