import { Button } from "../components/Button.tsx";
import { Color } from "https://deno.land/x/colors@v1.0.0/mod.ts";
async function setScore(username: string, newCount: number) {
  return await fetch(`/api/score?new_score=${newCount}&username=${username}`, {
    method: "POST",
  });
}

class GameArea {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  score: number;
  interval: number;
  player: GameComponent;
  course: GameComponent[];
  scoreComponent: GameScore;
  username: string;
  constructor(canvas: HTMLCanvasElement, username: string) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    this.course = [];
    this.username = username;
    this.canvas.width = 500;
    this.canvas.height = 250;
    this.score = 0;
    this.interval = 0;
    this.scoreComponent = new GameScore(
      "30px",
      "courier",
      350,
      250,
      new Color("#e0e0e0"),
    );
    this.player = new GameComponent(
      ComponentType.CHOPPER,
      30,
      120,
      20,
      20,
      new Color("#fffd00"),
    );
  }
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  end() {
    clearInterval(this.interval);
  }
  gameOver() {
    this.end();
    setScore(this.username, this.score);
  }
  update() {
    if (!this.course) this.course = [];
    for (let i = 0; i < this.course.length; i += 1) {
      if (this.player.collide(this.course[i])) {
        this.gameOver();
      }
    }
    this.clear();
    this.ctx.fillStyle = "#ff00c3";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.score += 1;
    if (this.score == 1 || this.score % 10 === 0) {
      // start at the end of the screen
      const x = this.canvas.width;
      const height = [20, 50];
      const h = Math.floor(
        Math.random() * (height[1] - height[0] + 1) + height[0],
      );
      const gap = [200, 300];
      const g = Math.floor(
        Math.random() * (gap[1] - gap[0] + 1) + gap[0],
      );

      // ceiling
      this.course.push(
        new GameComponent(
          ComponentType.WALL,
          x,
          0,
          10,
          h,
          new Color("#232323"),
        ),
      );
      // floor
      this.course.push(
        new GameComponent(
          ComponentType.WALL,
          x,
          h + g,
          10,
          x - h - g,
          new Color("#232323"),
        ),
      );
      // obstacle
      if (this.score % 30 === 0) {
        const obstacleHeight = Math.random() * 10 + 5;
        this.course.push(
          new GameComponent(
            ComponentType.WALL,
            x,
            h + g - obstacleHeight - (Math.random() * (g - 30)),
            10,
            obstacleHeight,
            new Color("#232323"),
          ),
        );
      }
    }
    for (let i = 0; i < this.course.length; i += 1) {
      this.course[i].x += -1;
      this.course[i].update(this);
    }
    this.scoreComponent.update(this, this.score);
    this.player.nextFrame(this);
    this.player.update(this);
  }
  start() {
    this.canvas.width = 480;
    this.canvas.height = 270;
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.score = 0;
    this.player.gravity = 0.05;
    this.interval = setInterval(() => this.update(), 20);
  }
}
class GameScore {
  size: string;
  font: string;
  x: number;
  y: number;
  color: Color;
  constructor(size: string, font: string, x: number, y: number, color: Color) {
    this.size = size;
    this.font = font;
    this.x = x;
    this.y = y;
    this.color = color;
  }
  update(game: GameArea, score: number) {
    const ctx = game.ctx;
    ctx.font = `${this.size} ${this.font}`;
    ctx.fillStyle = this.color.toString();
    ctx.fillText(`${score}`.padStart(6, "0"), this.x, this.y);
  }
}
enum ComponentType {
  WALL,
  CHOPPER,
}
class GameComponent {
  /** Chopper / Wall */
  type: ComponentType;
  /** Dimensions of the component */
  width: number;
  height: number;
  /** Speed of the component */
  speedY: number;
  /** Gravity (vertical acceleration) */
  gravity: number;
  /** Position of the component */
  x: number;
  y: number;
  color: Color;
  constructor(
    type: ComponentType,
    x: number,
    y: number,
    width: number,
    height: number,
    color: Color,
  ) {
    this.type = type;
    this.width = width;
    this.height = height;
    this.speedY = 0;
    this.x = x;
    this.y = y;
    this.gravity = 0;
    this.color = color;
  }
  get boundary(): [number, number, number, number] {
    return [this.x, this.x + this.width, this.y, this.y + this.height];
  }
  collide(that: GameComponent): boolean {
    // left right top bottom
    const thisB = this.boundary;
    const thatB = that.boundary;
    console.log(thisB, thatB);
    if (
      thisB[3] < thatB[2] || thisB[2] > thatB[3] || thisB[0] > thatB[1] ||
      thisB[1] < thatB[0]
    ) return false;
    return true;
  }
  nextFrame(game: GameArea) {
    const boundary = game.canvas.height - this.height;
    if (this.y <= boundary) {
      this.speedY += this.gravity;
      this.y += this.speedY;
    }
    if (this.y > boundary || this.y <= 0) {
      game.gameOver();
    }
  }
  update(game: GameArea) {
    const ctx = game.ctx;
    ctx.fillStyle = this.color.toString();
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

export default function Chopper() {
  let username = "";
  function formSubmit(e: Event) {
    e.preventDefault();
    const _username = new FormData(e.currentTarget as HTMLFormElement).get(
      "username",
    ) as string;
    username = _username;
    (e.currentTarget as HTMLFormElement).remove()
    startGame();
  }
  function startGame() {
    const gameDiv = document.querySelector("#gameArea");
    if (gameDiv?.hasChildNodes()) return;
    const gameArea = document.createElement("canvas");
    gameDiv?.appendChild(gameArea);
    const game = new GameArea(gameArea, username);
    document.body.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === " ") game.player.gravity = -0.1;
    });
    document.body.addEventListener("keyup", (e: KeyboardEvent) => {
      if (e.key === " ") game.player.gravity = 0.05;
      if (e.key === "Enter" || e.key === "Return") {
        game.canvas.requestFullscreen()
      }
    });
    game.start();
  }

  return (
    <div class="flex flex-col items-center gap-2 w-full">
      <form class="flex gap-5 items-center" onSubmit={formSubmit}>
        <label for="username">Username:</label>{" "}
        <input
          type="text"
          name="username"
          id="username"
          class="bg-gray-300 p-2"
          minLength={4}
        />
        <button class="bg-gray-300 border-black p-2">Start</button>
      </form>
      <div class="font-black">{username}</div>
      <div id="gameArea"></div>
    </div>
  );
}
