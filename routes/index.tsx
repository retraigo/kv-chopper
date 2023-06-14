import type { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { ScoreCard } from "../components/Scorecard.tsx";
import Chopper from "../islands/Chopper.tsx";
import { getAllScores } from "../utils/db.ts";
import { useState } from "preact/hooks";

export const handler: Handlers<{scores: [string, number][]}> = {
  async GET(_req, ctx) {
    const scores = await getAllScores();
    return ctx.render({ scores });
  },
};

export default function Home(props: PageProps<{scores: [string, number][]}>) {
  return (
    <>
      <Head>
        <title>Weird Copter</title>
      </Head>
      <div class="p-4 mx-auto max-w-screen-md flex flex-col items-center gap-8">
        <div class = "tracking-wide">Hold {`<spacebar>`} to go up. Press {`<enter>`} to go fullscreen.</div>
          <Chopper />
          <ScoreCard scores={props.data.scores.sort((a, b) => b[1] - a[1]).slice(0, 10)} />
      </div>
    </>
  );
}
