import { Handlers } from "$fresh/server.ts";
import { setScore } from "../../utils/db.ts";

export const handler: Handlers = {
  async POST(req) {
    const url = await new URL(req.url).searchParams;
    const newScore = url.get("new_score")
    const username = url.get("username")
    if (isNaN(Number(newScore)) || !username) return new Response(null, { status: 400 });

    await setScore(username, Number(newScore));
    return new Response();
  },
};
