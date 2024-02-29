import { isAxiosError } from "axios";
import { Scenes, Markup } from "telegraf";

import {
  CANCEL_ACTION,
  GENERATE_VIDEO_SCENE,
  VIDEO_DELAY_SECONDS,
} from "../constants";

import { Api, sleep } from "../lib";

export const generateVideoScene = new Scenes.WizardScene<Scenes.WizardContext>(
  GENERATE_VIDEO_SCENE,
  async (ctx) => {
    const session = ctx.session as any;
    const isRetrying = session.isRetrying as boolean | undefined;

    if (isRetrying)
      await ctx.reply(
        "Enter another prompt or cancel to get video",
        Markup.inlineKeyboard([
          Markup.button.callback("Cancel", CANCEL_ACTION),
        ]),
      );
    else await ctx.reply("Enter your prompt");

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
      "$SORAI is generating your Video ID.\n Video Generation might take up to a minute or more.",
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
