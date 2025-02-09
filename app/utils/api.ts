import { Character, Message } from "../components/types";

export async function getImage(
  prompt: string | string[],
  isAdmin: boolean
): Promise<string> {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    prompt: typeof prompt === "string" ? prompt : prompt.toString(),
    negative_prompt: isAdmin
      ? "score_6, score_5, score_4, pony, gaping, censored, furry, child, kid, chibi, 3d, photo, monochrome, elven ears, anime, multiple cocks, extra legs, extra hands, mutated legs, mutated hands, big man, high man, muscular man, muscular hands"
      : ` nude, flower, facial marking, (women:1.2), (female:1.2), blue jeans, 3d,
render, doll, plastic, blur, haze, monochrome, b&w, text, (ugly:1.2),
unclear eyes, no arms, bad anatomy, cropped, censoring,
asymmetric eyes, bad anatomy, bad proportions, cropped,
cross-eyed, deformed, extra arms, extra fingers, extra limbs, fused
fingers, jpeg artifacts, malformed, mangled hands, misshapen
body, missing arms, missing fingers, missing hands, missing legs,
poorly drawn, tentacle fingers, too many arms, too many fingers,
watermark, logo, text, letters, signature, username, words, blurry,
cropped, jpeg artifacts, low quality, lowres
`,
    width: isAdmin ? 832 : 512,
    height: isAdmin ? 1216 : 768,
    samples: 1,
    steps: isAdmin ? 30 : 20,
    cfg_scale: 7,
    sampler: isAdmin ? "Euler a" : "DPM++ 2M",
    schedule_type: isAdmin ? "Automatic" : "Karras",
    model_hash: isAdmin ? "059934ff58" : "bb7e29def5",
    model: isAdmin
      ? "ponyRealism_V21MainVAE.safetensors [059934ff58]"
      : "rpg_v5.safetensors [bb7e29def5]",
    clip_skip: 2,
  });

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_CLOUDFLARE_URL}/sdapi/v1/txt2img`,
    requestOptions
  );
  const result = await response.json();
  return result.images[0];
}

export const getImageOfEvents = async (
  messages: Message[],
  summary: string,
  isAdmin: boolean,
  characters?: Character[]
) => {
  const curatedMessages = messages
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
          ? process.env.NEXT_PUBLIC_IMAGE_SYSTEM_TEXT
          : process.env.NEXT_PUBLIC_IMAGE_SYSTEM_TEXT_PC,
      },
      ...(characters
        ? [
            {
              role: "system",
              content:
                "JSON object representing characters in the story (note that clothes might be out of date with the story)" +
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
      ...(summary
        ? [
            {
              role: "system",
              content:
                "Summary of the events that have happened so far: " + summary,
            },
          ]
        : []),
      ...curatedMessages,
      {
        role: "user",
        content: `For this response, return a list of strings used to create a stable diffusion prompt of the current person or creature in the scene and their action based on the last message in the scene. The will be used to generate an image for the narrative

return the comma separated string followed by exactly three pipes ||| describe what the character or creature is doing in the scene. be as accurate as possible to what she is wearing and her current action in the context of the story
example:
${
  isAdmin
    ? process.env.NEXT_PUBLIC_IMAGE_EXAMPLE_TEXT
    : process.env.NEXT_PUBLIC_IMAGE_EXAMPLE_TEXT_PC
}
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
    return data.choices[0].message.content;
  } catch (error) {
    console.error(error);
  }
};
