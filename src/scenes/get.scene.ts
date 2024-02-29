import { Scenes, Input } from "telegraf";

import { Api } from "../lib";
import { GET_VIDEO_SCENE } from "../constants";
import { isAxiosError } from "axios";

export const getVideoScene = new Scenes.WizardScene<Scenes.WizardContext>(
  GET_VIDEO_SCENE,
  async (ctx) => {
    await ctx.reply("Enter video id:");
    ctx.wizard.next();
  },
  async (ctx) => {
    const message = ctx.message as any;
    const text = message.text as string;

    if (text.startsWith("/")) {
      return ctx.reply(
        "Can't run command. /cancel before running new command.",
      );
    }

    try {
      const response = await Api.instance.video.getVideo(text);

      if (response) ctx.replyWithVideo(Input.fromBuffer(response));
      else await ctx.reply("Video still generating in background ✨!");
    } catch (error) {
      if (isAxiosError(error))
        await ctx.reply(error.response.data.);
      return ctx.scene.reenter();
    }

    ctx.scene.leave();
  },
);
