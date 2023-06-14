export function ScoreCard(props: { scores: [string, number][] }) {
  return (
    <div class="flex flex-col items-center p-4">
      <div class="text-2xl">Leaderboard</div>
      <ul class="flex flex-col gap-4">
        {props.scores.map(([name, score]) => (
          <li class="grid grid-cols-2 gap-4 justify-between">
            <div class="font-bold text-left">{name}</div>{" "}
            <div class="font-semibold self-end text-right">{`${score}`.padStart(6, "0")}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
