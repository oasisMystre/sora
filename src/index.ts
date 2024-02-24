import "dotenv/config";
import { Telegraf, Scenes, session, Markup } from "telegraf";

import getScene, { getImageScene, getVideoScene } from "./scenes/get.scene";
import generateScene, {
  generateImageScene,
  generateVideoScene,
} from "./scenes/generate.scene";
import { GENERATE_SCENE, GET_SCENE } from "./constants";

export function main() {
  const bot = new Telegraf<Scenes.WizardContext>(
    process.env.TELEGRAM_BOT_API_KEY
  );
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
      command: "get",
      description: "get a media file by id",
    },
    {
      command: "generate",
      description: "generate short video from text prompt",
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

  bot.help((ctx) => {
    return ctx.replyWithMarkdownV2(
      `I can help you create ai generated images and videos. If you are new to Sora Bot, Please read the below manual.
      
       You can control me by sending these commands:
       
       /get get a media file by id
       /generate generate short video from text prompt

      Steps to generate ai media

      1. Type the command /generate
      2. Select the video or image option
      3. Input your prompt
      4. An image or media id will be returned

      Steps to get a media output using id
      
      1. Type the command /get
      2. Select the video option
      3. Input your video id
      4. The media will be returned
      `
    );
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

  console.log("Bot starting...");
  bot.launch();

  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
}

main();
