import "dotenv/config";

import fs from "fs";
import { fastify } from "fastify";
import { Telegraf, Scenes, session, Markup } from "telegraf";

import { getVideoScene } from "./scenes/get.scene";
import { generateVideoScene } from "./scenes/generate.scene";
import {
  GENERATE_SCENE,
  GENERATE_VIDEO_SCENE,
  GET_VIDEO_SCENE,
} from "./constants";

export function createBot(accessToken: string) {
  const bot = new Telegraf<Scenes.WizardContext>(accessToken);

  const scenes = [getVideoScene, generateVideoScene];
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
      Markup.keyboard([["/generate"], ["/get"], ["/socials"]]),
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

  bot.catch(async (err: any, ctx) => {
    console.error(err);
    try {
      await ctx.reply("Message not sent due to an error.");
    } catch (e) {
      console.error("Could not send error message to chat: ", err);
    }
  });

  return bot;
}
async function main() {
  const app = fastify();
  const bot = createBot(process.env.TELEGRAM_BOT_API_KEY);

  const port = Number(process.env.PORT);
  const webhook = await bot.createWebhook({
    domain: process.env.RENDER_EXTERNAL_HOSTNAME,
  }) as any;

  app.post(`/telegraf/${bot.secretPathComponent()}`, webhook);

  app.listen({ port }).then(() => console.log("Listening on port", port));
}

main().catch(console.log);
