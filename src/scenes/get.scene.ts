import { Scenes, Composer, Markup, Input } from "telegraf";
import {
  GET_IMAGE_SCENE,
  GET_SCENE,
  GET_VIDEO_ACTION,
  GET_VIDEO_SCENE,
} from "../constants";
import { Api } from "../lib";

const stepHandler = new Composer<Scenes.SceneContext>();

stepHandler.action(GET_VIDEO_ACTION, async (ctx) => {
  await ctx.scene.leave();
  await ctx.scene.enter(GET_VIDEO_SCENE);
});
stepHandler.command(GET_VIDEO_ACTION, async (ctx) => {
  await ctx.scene.leave();
  await ctx.scene.enter(GET_VIDEO_SCENE);
});

stepHandler.command("cancel", async (ctx) => {
  await ctx.scene.leave();
});

stepHandler.use((ctx) =>
  ctx.replyWithMarkdownV2(`press /cancel to leave scene`)
);

const getScene = new Scenes.WizardScene<Scenes.WizardContext>(
  GET_SCENE,
  (ctx) => {
    ctx.reply(
      "What do you want to get?",
      Markup.inlineKeyboard([Markup.button.callback("video", GET_VIDEO_ACTION)])
    );

    ctx.wizard.next();
  },
  stepHandler
);

export const getImageScene = new Scenes.WizardScene<Scenes.WizardContext>(
  GET_IMAGE_SCENE,
  async (ctx) => {
    await ctx.reply("Enter image id");
    ctx.wizard.next();
  },
  (ctx) => {
    console.log(ctx.message);
    ctx.scene.leave();
  }
);

export const getVideoScene = new Scenes.WizardScene<Scenes.WizardContext>(
  GET_VIDEO_SCENE,
  async (ctx) => {
    await ctx.reply("Enter video id");
    ctx.wizard.next();
  },
  async (ctx) => {
    const message = (ctx.message as any).text;
    const response = await Api.instance.video.getVideo(message);

    if (response) ctx.replyWithVideo(Input.fromBuffer(response));
    else ctx.reply("Video still processing");

    ctx.scene.leave();
  }
);

export default getScene;
