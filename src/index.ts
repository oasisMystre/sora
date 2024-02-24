import fs from "fs";
import "dotenv/config";
import { Telegraf, Scenes, session, Markup } from "telegraf";

import getScene, { getImageScene, getVideoScene } from "./scenes/get.scene";
import generateScene, {
  generateImageScene,
  generateVideoScene,
} from "./scenes/generate.scene";
import { GENERATE_SCENE, GET_SCENE } from "./constants";

export function main(bot: Telegraf<Scenes.WizardContext>) {
  const stage = new Scenes.Stage<Scenes.SceneContext>([
    getScene,
    generateScene,
    getImageScene,
    getVideoScene,
    generateImageScene,
    generateVideoScene,
  ]);
  bot.use(session());
  bot.use(stage.middleware());

  bot.telegram.setMyCommands([
    {
      command: "generate",
      description: "generate short video from text prompt",
    },
    {
      command: "get",
      description: "get a media file by id",
    },
    {
      command: "help",
      description: "Show sora help",
    },
  ]);

  bot.start((ctx) => {
    return ctx.reply(
      "Welcome to sora video and image generation bot. Select an action!",
      Markup.keyboard([["/get"], ["/generate"]])
    );
  });

  bot.command("help", (ctx) => {
    return ctx.replyWithMarkdownV2(fs.readFileSync("./help.md", "utf-8"));
  });

  bot.action("get", async (ctx) => {
    ctx.scene.enter(GET_SCENE);
  });
  bot.command("get", async (ctx) => {
    ctx.scene.enter(GET_SCENE);
  });

  bot.action("generate", async (ctx) => {
    ctx.scene.enter(GENERATE_SCENE);
  });

  bot.command("generate", async (ctx) => {
    ctx.scene.enter(GENERATE_SCENE);
  });
}

const bot = new Telegraf<Scenes.WizardContext>(
  process.env.TELEGRAM_BOT_API_KEY
);

main(bot);

console.log("Bot starting...");
bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
