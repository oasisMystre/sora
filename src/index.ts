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
  ]);

  bot.start((ctx) => {
    return ctx.reply(
      "Welcome to sora video and image generation bot. Select an action!",
      Markup.keyboard([["/get"], ["/generate"]])
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
