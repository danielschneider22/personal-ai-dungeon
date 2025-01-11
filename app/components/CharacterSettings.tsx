import { ScrollArea } from "@/components/ui/scroll-area";
import { Character, Message } from "./types";
import CharacterCard from "./CharacterCard";
import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction, useState } from "react";
import { getImage } from "../utils/api";

//           \n\n1. **0-10: Sexually Reserved**\n   - **Wear:** Prefer modest clothing, often covering most of their skin.\n   - **Activities:** Actively avoid sexual interaction and frown upon those activities\n   - **Description:** They may have strong personal or cultural beliefs about sexual activity, or perhaps just aren't interested in it. They are prudes\n\n2. **10-20: Sexually Cautious**\n   - **Wear:** Still modest, but may show a bit more skin, e.g., short sleeves, knees-length skirts.\n   - **Activities:** Open to dating, but take things slow. May enjoy kissing and very light petting.\n   - **Description:** They are selective about their partners and don't really engage actively in sex.\n\n3. **20-30: Sexually Curious**\n   - **Wear:** May start to experiment with more form-fitting clothing, but still relatively modest.\n   - **Activities:** Heavy petting, making out. Open to discussing and exploring sexual topics.\n   - **Description:** They are becoming more comfortable with their sexuality and are interested in learning more.\n\n4. **30-40: Sexually Active**\n   - **Wear:** More revealing clothing, e.g., v-necks, mini skirts, but still tasteful.\n   - **Activities:** In addition to kissing they like their breasts being played with.\n   - **Description:** They are more comfortable with their sexuality and are open to vanilla experiences.\n\n5. **40-50: Sexually Adventurous**\n   - **Wear:** Lingerie, sexy outfits, but keeps it classy in public.\n   - **Activities:** Open to light kinks, role-playing, and different positions.\n   - **Description:** They enjoy exploring different aspects of sexuality and are open to new experiences.\n\n6. **50-60: Sexually Liberated**\n   - **Wear:** Comfortable in lingerie, may wear more revealing clothing in public.\n   - **Activities:** Open to more kinks, sex parties, and public displays of affection. They might want to do group masturbation or other riskier kinks\n   - **Description:** They are very comfortable with their sexuality and enjoy exploring it in various ways.\n\n7. **60-70: Sexually Uninhibited**\n   - **Wear:** Frequently in lingerie or other sexy outfits, may wear provocative clothing in public.\n   - **Activities:** Open to most kinks, group sex, and swinging.\n   - **Description:** They have very few sexual inhibitions and enjoy exploring their fantasies. More open to being called slut or bimbo\n\n8. **70-80: Sexually Insatiable**\n   - **Wear:** Often in lingerie or other sexy outfits, may wear very provocative clothing in public.\n   - **Activities:** Actively seeks out new partners, kinks, and experiences. May engage in exhibitionism.\n   - **Description:** They have a very high sex drive and are constantly looking for new experiences. They start like being called slut and bimbo and ask you to call them that. Their lust clouds their mind during the day and they are constantly horny.\n\n9. **80-90: Sexually Obsessed**\n   - **Wear:** Often in very revealing or fetish-specific outfits, may have difficulty \"covering up\" in public.\n   - **Activities:** Actively engages in many kinks, may have difficulty forming emotional connections.\n   - **Description:** Their life is heavily focused on sexual activities and thoughts.\n\n10. **90-100: Sexually Deprived (in the sense of the original request)**\n    - **Wear:** May refuse to wear clothes, or only wear very revealing/fetish outfits.\n    - **Activities:** Actively engages in many kinks, may have difficulty functioning in day-to-day life due to sexual obsessions.\n    - **Description:** Their life and thoughts are dominated by sex. They may struggle with daily activities due to their constant preoccupation."

interface SettingsPanelProps {
  messages: Message[];
  summary: string;
  characters: Character[];
  setCharacters: Dispatch<SetStateAction<Character[]>>;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  messages,
  summary,
  characters,
  setCharacters,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  function updateCharacterImages(newCharacters?: Character[]) {
    const myCharacters = newCharacters || characters;
    if (myCharacters.length && !isLoading) {
      const updateCharacterImages = async () => {
        const updatedCharacters = await Promise.all(
          myCharacters.map(async (character) => {
            if (!character.mainCharacter && character.imageDesc) {
              const image = await getImage(character.imageDesc);
              return { ...character, image }; // Update character with fetched image
            }
            return character; // Return the character unchanged if it's the main character
          })
        );

        setCharacters(updatedCharacters); // Update state with all characters
      };

      updateCharacterImages();
    }
  }

  async function handleGenerateCharacters() {
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

          Based on the current story generate an array of characters based on the current events in the story using the model outlined below. 
          Important: only include the array in the output. For elements of the array, always provide the keys provided and just those keys (name, description, meter, traits, imageDesc, goals, misc, and mainCharacter). We will be using eval(response) to parse this array.
          ${
            characters.length &&
            `Use the previous character profiles as a basis. `
          }
          
          Ensure the returned value is valid json. 

          meter is a slut meter, a representation of how slutty the character is. It is a number that is min 0 max 100. do not include for main character
          meterDesc is a detailed description of how depraved they are based on their meter number. do not include for main character.

          traits are a series of physical and personality traits for that character. This is optional.

          goals is that characters current goals. This is optional.

          imageDesc is a list of strings used to create a stable diffusion prompt of the current person in the scene and their action. The will be used to generate an image for the character
          example of imageDesc: ${process.env.NEXT_PUBLIC_IMAGE_EXAMPLE_TEXT}

          appearance: a list of strings that describes the physical appearance of a character. only include this for non-main characters. always include hair color, breast size, and clothes. include anything else optionally. get very detailed on each part of their outfit (outerwear and underwear)

          misc is any text that doesn't fit into any of the previous categories. it can hold previous stats and gives a brief description of how the character has changed since the previous report

          example of full output:
              [
                {
                name: "Lucy",
                description: "Lucy is a cheerful and friendly girl from your local school, Greenwood High. She's got a cute, athletic build with medium breasts, and she's the kind of person who can make anyone feel at ease with her genuine smile and sparkling eyes. She's a year younger than you, and you two have seen each other around campus but never really hung out until now. Lucy has a slut score of 25, you're hypnosis has started to affect her psyche and make her more open to lewd behavior",
                meter: 25,
                meterDesc: 
                traits: ["**Flirtatious**: Lucy is naturally charismatic and enjoys the art of playful banter. She likes making people feel desired and doesn't shy away from innocent touch. She enjoys the dance of courtship and has always always had a soft spot for you.", "**Exhibitionist streak**: Lucy gets a thrill from the idea of being caught. She likes the rush of excitement. She wants to feel the cool breeze as she takes you in the great outdoors. She fantasizes about putting on a show and letting others watch as she sucks you dry."],
                imageDesc: "medium breasts, pink bikini, schoolgirl, blonde, biting lip, looking up, standing, lustful",
                appearance: ["Hair Color: Blonde", "Breast size: C", "Clothes: A tight blue dress. Conservative blue panties and bra. Red high heels."]
              },
              {
                name: "Dan (Main Character)",
                description: "You are a smart charasmatic individual who is trying to convert women into sluts.",
                meter: 0,
                traits: ["***Athletic**: You are in prime condition."]
                imageDesc: "male, teacher, brown hair, athletic",
                mainCharacter: true,
                goals: ["School slut transformation: Turn every girl at the school into your personal bimbo", "Improved Athletics: Gain 20 lbs of muscle"],
                misc: "Current spells acquired: 
                1. **Lustful Gaze**
- *Mana Cost*: 10
- *Duration*: 5 minutes
- *Effect*: Makes the target see you as highly attractive and desirable.
- *Cooldown*: 10 minutes

2. **Arousing Touch**
- *Mana Cost*: 15
- *Duration*: 1 minute
- *Effect*: Your touch stimulates the target's senses, making them highly aroused.
- *Cooldown*: 15 minutes

3. **Whispers of Desire**
- *Mana Cost*: 20
- *Duration*: 3 minutes
- *Effect*: Your words incite lustful thoughts in the target, making them want you.
- *Cooldown*: 20 minutes

4. **Minor Transformation**
- *Mana Cost*: 30
- *Duration*: 1 hour
- *Effect*: Alters a small aspect of the target's personality or appearance, twisting it towards your desires.
- *Cooldown*: 1 hour

 Strenth: 5 Constitution: 3 Dexterity: 8 Charisma: 20"
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

      const newCharacters = eval(
        aiReply.replaceAll("json", "").replaceAll("`", "")
      );

      setCharacters(newCharacters);
      updateCharacterImages(newCharacters);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ScrollArea className="h-full llama relative">
      <div className="flex justify-center w-full">
        <Button
          onClick={() => handleGenerateCharacters()}
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
          <div className="w-12 h-12 border-4 border-t-4 border-gray-100 border-solid rounded-full animate-spin"></div>
        </div>
      )}

      {/* Character Cards */}
      {characters
        .sort((a, b) => (b.mainCharacter ? 1 : 0) - (a.mainCharacter ? 1 : 0))
        .map((character) => (
          <CharacterCard key={character.id} character={character} />
        ))}
    </ScrollArea>
  );
};

export default SettingsPanel;
