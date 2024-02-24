import fs from "fs";
import tmp from "tmp";
import { Scenes, Markup, Composer } from "telegraf";

import {
  GENERATE_IMAGE_ACTION,
  GENERATE_IMAGE_SCENE,
  GENERATE_SCENE,
  GENERATE_VIDEO_ACTION,
  GENERATE_VIDEO_SCENE,
} from "../constants";
import { Api } from "../lib";

const stepHandler = new Composer<Scenes.SceneContext>();

stepHandler.action(GENERATE_IMAGE_ACTION, async (ctx) => {
  await ctx.scene.leave();
  await ctx.scene.enter(GENERATE_IMAGE_SCENE);
});
stepHandler.command(GENERATE_IMAGE_ACTION, async (ctx) => {
  await ctx.scene.leave();
  await ctx.scene.enter(GENERATE_IMAGE_SCENE);
});

stepHandler.action(GENERATE_VIDEO_ACTION, async (ctx) => {
  await ctx.scene.leave();

  await ctx.scene.enter(GENERATE_VIDEO_SCENE);
});
stepHandler.command(GENERATE_VIDEO_ACTION, async (ctx) => {
  await ctx.scene.leave();
  await ctx.scene.enter(GENERATE_VIDEO_SCENE);
});

stepHandler.command("cancel", async (ctx) => {
  await ctx.scene.leave();
});

stepHandler.use((ctx) =>
  ctx.replyWithMarkdownV2(`press /cancel to leave scene`)
);
const generateScene = new Scenes.WizardScene<Scenes.WizardContext>(
  GENERATE_SCENE,
  (ctx) => {
    ctx.reply(
      "What do you want to generate?",
      Markup.inlineKeyboard([
        Markup.button.callback("image", GENERATE_IMAGE_ACTION),
        Markup.button.callback("video", GENERATE_VIDEO_ACTION),
      ])
    );

    ctx.wizard.next();
  },
  stepHandler
);

export const generateImageScene = new Scenes.WizardScene<Scenes.WizardContext>(
  GENERATE_IMAGE_SCENE,
  async (ctx) => {
    await ctx.reply("Enter your prompt?");
    ctx.wizard.next();
  },
  async (ctx) => {
    const message = (ctx.message as any).text;
    const { data } = await Api.instance.image.generateImage({
      text_prompts: [
        {
          text: message,
        },
      ],
    });

    for (const artifact of data.artifacts) {
      await ctx.replyWithPhoto({
        source: Buffer.from(artifact.base64, "base64"),
      });
    }

    await ctx.scene.leave();
  }
);
export const generateVideoScene = new Scenes.WizardScene<Scenes.WizardContext>(
  GENERATE_VIDEO_SCENE,
  async (ctx) => {
    await ctx.reply("Enter your prompt?");
    ctx.wizard.next();
  },
  async (ctx) => {
    const message = (ctx.message as any).text;
    const { data: imageResponse } = await Api.instance.image.generateImage({
      width: 768,
      height: 768,
      text_prompts: [
        {
          text: message,
        },
      ],
    });

    const image = Buffer.from(imageResponse.artifacts.at(0)!.base64, "base64");

    const { data } = await Api.instance.video.generateVideo({
      image,
    });

    console.log(data);

    await ctx.replyWithPhoto(
      { source: image },
      {
        caption: "Video Id " + data.id,
      }
    );

    await ctx.scene.leave();
  }
);

export default generateScene;
