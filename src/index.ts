import fs from "fs";
import "dotenv/config";
import { Telegraf, Scenes, session, Markup } from "telegraf";

import { getVideoScene } from "./scenes/get.scene";
import {
  generateImageScene,
  generateScene,
  generateVideoScene,
} from "./scenes/generate.scene";
import {
  GENERATE_SCENE,
  GENERATE_VIDEO_SCENE,
  GET_VIDEO_SCENE,
} from "./constants";

export function main(bot: Telegraf<Scenes.WizardContext>) {
  const scenes = [
    getVideoScene,
    generateScene,
    generateImageScene,
    generateVideoScene,
  ];
  const stage = new Scenes.Stage<Scenes.SceneContext>(scenes);

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
      command: "cancel",
      description: "Cancel and go back to main menu",
    },
    {
      command: "help",
      description: "Show sora help",
    },
    {
      command: "socials",
      description: "Show our social media handles and website",
    },
  ]);

  bot.start(async (ctx) => {
    await ctx.reply(
      "Welcome to sora video generation bot. Select an action!",
      Markup.keyboard([["/get"], ["/generate"], ["/socials"]]),
    );
  });

  scenes.forEach((scene) => {
    scene.command("cancel", async (ctx) => {
      await ctx.scene.leave();
    });
  });

  bot.command("help", async (ctx) => {
    await ctx.replyWithMarkdownV2(fs.readFileSync("./help.md", "utf-8"));
  });

  bot.action("get", async (ctx) => {
    await ctx.scene.enter(GET_VIDEO_SCENE);
  });
  bot.command("get", async (ctx) => {
    await ctx.scene.enter(GET_VIDEO_SCENE);
  });

  bot.action("generate", async (ctx) => {
    await ctx.scene.enter(GENERATE_SCENE);
  });

  bot.command("generate", async (ctx) => {
    await ctx.scene.enter(GENERATE_VIDEO_SCENE);
  });

  bot.command("socials", async (ctx) => {
    await ctx.replyWithMarkdownV2(fs.readFileSync("./socials.md", "utf-8"));
  });
}

const bot = new Telegraf<Scenes.WizardContext>(
  process.env.TELEGRAM_BOT_API_KEY,
);

main(bot);

console.log("Bot starting...");
bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
