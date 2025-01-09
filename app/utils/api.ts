export async function getImage(prompt: string): Promise<string> {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    prompt: prompt,
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
