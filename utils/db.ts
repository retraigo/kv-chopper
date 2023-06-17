const kv = await Deno.openKv();

const PREFIX = ["score"];

export async function setScore(username: string, newCount: number) {
  await kv.set([...PREFIX, Date.now(), username], newCount);
}

export async function getAllScores(): Promise<[string, number][]> {
  const promises: Promise<unknown>[] = [];
  const result: [string, number][] = [];
  const keys = kv.list({ prefix: ["score"] });
  for await (const entry of keys) {
    promises.push(kv.get(entry.key));
    result.push([entry.key[2], 0]);
  }
  (await Promise.all(promises)).map((x, i) =>
    result[i][1] = (x as { value: number }).value
  );
  return result;
}
