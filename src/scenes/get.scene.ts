import { Scenes, Input } from "telegraf";

import { Api } from "../lib";
import { GET_VIDEO_SCENE } from "../constants";

export const getVideoScene = new Scenes.WizardScene<Scenes.WizardContext>(
  GET_VIDEO_SCENE,
  async (ctx) => {
    await ctx.reply("Enter video id:");
    ctx.wizard.next();
  },
  async (ctx) => {
    const message = ctx.message as any;
    const response = await Api.instance.video.getVideo(message.text);

    if (response) ctx.replyWithVideo(Input.fromBuffer(response));
    else await ctx.reply("Video still generating in background ✨!");

    ctx.scene.leave();
  },
);
