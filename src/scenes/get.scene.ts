import { Scenes, Input } from "telegraf";

import { Api } from "../lib";
import { GET_VIDEO_SCENE } from "../constants";
import { isAxiosError, HttpStatusCode } from "axios";

const errorMessage = {
  [HttpStatusCode.BadRequest]:
    "This error is from us, don't panick. Contact developer for more details.",
  [HttpStatusCode.NotFound]: "No generation found for the provided ID.",
  [HttpStatusCode.InternalServerError]:
    "An unexpected server error has occurred, please try again later.",
};

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
      ctx.reply("Can't run command. /cancel before running new command.");
      return;
    }

    try {
      const response = await Api.instance.video.getVideo(text);

      if (response) await ctx.replyWithVideo(Input.fromBuffer(response));
      else await ctx.reply("Video still generating in background ✨!");
    } catch (error) {
      if (isAxiosError(error)) await ctx.reply(errorMessage[error.status]);
      else {
        await ctx.reply("An unexpected error occur, Try again!");
        await ctx.scene.reenter();
      }
    }

    await ctx.scene.leave();
  },
);
