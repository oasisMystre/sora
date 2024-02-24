import { ApiImpl } from "./impl";
import { ImageError, ImageParams, ImageResponse } from "./models/image.model";

export default class ImageApi extends ApiImpl {
  path: string = "v1/generation/stable-diffusion-v1-6/";

  generateImage({
    width = 512,
    height = 512,
    cfg_scale = 7,
    sample = 1,
    seed = 0,
    steps = 30,
    text_prompts,
  }: ImageParams) {
    return this.axios.post<ImageResponse>(
      this.buildPath("text-to-image"),
      {
        seed,
        steps,
        width,
        height,
        sample,
        cfg_scale,
        text_prompts,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );
  }
}
