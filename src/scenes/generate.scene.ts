import { isAxiosError } from "axios";
import { Scenes, Markup, Composer } from "telegraf";

import {
  CANCEL_ACTION,
  GENERATE_IMAGE_ACTION,
  GENERATE_IMAGE_SCENE,
  GENERATE_SCENE,
  GENERATE_VIDEO_ACTION,
  GENERATE_VIDEO_SCENE,
  VIDEO_DELAY_SECONDS,
} from "../constants";

import { Api, sleep } from "../lib";

const stepHandler = new Composer<Scenes.SceneContext>();

function onGenerateAction(action: string) {
  return async (ctx: Scenes.SceneContext) => {
    await ctx.scene.leave();
    await ctx.scene.enter(action);
  };
}

stepHandler.action(
  GENERATE_VIDEO_ACTION,
  onGenerateAction(GENERATE_VIDEO_SCENE),
);

stepHandler.action(
  GENERATE_IMAGE_ACTION,
  onGenerateAction(GENERATE_IMAGE_SCENE),
);

stepHandler.command(
  GENERATE_IMAGE_ACTION,
  onGenerateAction(GENERATE_VIDEO_SCENE),
);

stepHandler.command(
  GENERATE_VIDEO_ACTION,
  onGenerateAction(GENERATE_IMAGE_SCENE),
);

stepHandler.action(CANCEL_ACTION, async (ctx) => {
  await ctx.scene.leave();
});

stepHandler.use((ctx) =>
  ctx.replyWithMarkdownV2("press /cancel to leave scene"),
);

export const generateScene = new Scenes.WizardScene<Scenes.WizardContext>(
  GENERATE_SCENE,
  (ctx) => {
     await ctx.reply(
      "What do you want to generate?",
      Markup.inlineKeyboard([
        Markup.button.callback("Image", GENERATE_IMAGE_ACTION),
        Markup.button.callback("Video", GENERATE_VIDEO_ACTION),
        Markup.button.callback("Cancel", CANCEL_ACTION),
      ]),
    );

    ctx.scene.next();
  },
  stepHandler,
);

export const generateImageScene = new Scenes.WizardScene<Scenes.WizardContext>(
  GENERATE_IMAGE_SCENE,
  async (ctx) => {
    await ctx.reply(
      "Enter your prompt?",
      Markup.inlineKeyboard([Markup.button.callback("Cancel", CANCEL_ACTION)]),
    );

    ctx.wizard.next();
  },
  async (ctx) => {
    const message = (ctx.message as any).text as string;

    if (message.trim().length === 0) {
      const message = ctx.message as any;

      if (!message || message.text.trim().length === 0) {
        await ctx.scene.leave();
        return;
      }

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
  },
);

export const generateVideoScene = new Scenes.WizardScene<Scenes.WizardContext>(
  GENERATE_VIDEO_SCENE,
  async (ctx) => {
    await ctx.reply("Enter your prompt");
    ctx.wizard.next();
  },
  async (ctx) => {
    const message = ctx.message as any;
    const text = message.text;

    if (text.startsWith("/")) {
      await ctx.reply("Can't run command. /cancel before running new command.");
      return;
    }

    await ctx.reply(
      "BlastAI is generating your Video ID.\n Video Generation might take up to a minute or more.",
    );

    try {
      const { data: imageResponse } = await Api.instance.image.generateImage({
        width: 768,
        height: 768,
        text_prompts: [
          {
            text,
          },
          {
            text: "This is a prompt for a video generative ai",
          },
        ],
      });

      const image = Buffer.from(
        imageResponse.artifacts.at(0)!.base64,
        "base64",
      );

      const { data } = await Api.instance.video.generateVideo({
        image,
      });

      await sleep(VIDEO_DELAY_SECONDS * 1000);
      await ctx.replyWithPhoto(
        { source: image },
        {
          caption: `Video Id \`${data.id}\``,
          parse_mode: "MarkdownV2",
        },
      );
    } catch (error) {
      if (isAxiosError(error)) {
        const data = error.response.data;

        if ("errors" in data) await ctx.reply(data.errors.join("."));
        else if ("message" in data) await ctx.reply(data.message);
        else {
          await ctx.reply("An unexpected error occur! Try again!");
          ctx.scene.reenter();
        }
      }
    }

    ctx.scene.leave();
  },
);
