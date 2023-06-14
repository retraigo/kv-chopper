const kv = await Deno.openKv();

const PREFIX = ["score"];

export async function setScore(username: string, newCount: number) {
  await kv.set([...PREFIX, Date.now(), username], newCount);
}

export async function getAllScores(): Promise<[string, number][]> {

  const result: [string, number][] = [];
  const keys = kv.list({prefix: ["score"]})
  for await (const entry of keys) {
    result.push([entry.key[2] as string, (await kv.get(entry.key)).value as number])
  }
  return result;
}