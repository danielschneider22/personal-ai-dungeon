import { Character, Message } from "../components/types";

export async function getImage(prompt: string | string[]): Promise<string> {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    prompt: typeof prompt === "string" ? prompt : prompt.toString(),
    negative_prompt:
      "score_6, score_5, score_4, pony, gaping, censored, furry, child, kid, chibi, 3d, photo, monochrome, elven ears, anime, multiple cocks, extra legs, extra hands, mutated legs, mutated hands, big man, high man, muscular man, muscular hands",
    width: 832,
    height: 1216,
    samples: 1,
    steps: 30,
    cfg_scale: 7,
    sampler: "Euler a",
    schedule_type: "Automatic",
    model_hash: "059934ff58",
    model: "ponyRealism_V21MainVAE.safetensors [059934ff58]",
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
  id: string | number,
  messages: Message[],
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
        content: process.env.NEXT_PUBLIC_IMAGE_SYSTEM_TEXT,
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
      ...curatedMessages,
      {
        role: "user",
        content: `For this response, return a list of strings used to create a stable diffusion prompt of the current person in the scene and their action. The will be used to generate an image for the narrative

return the comma separated string followed by exactly three pipes ||| then give a descriptor of the name of who is in the scene and what they are doing
example:
${process.env.NEXT_PUBLIC_IMAGE_EXAMPLE_TEXT}
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
    console.log(error);
  }
};
