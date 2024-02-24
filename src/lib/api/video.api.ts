import tmp from "tmp";
import { HttpStatusCode } from "axios";

import { ApiImpl } from "./impl";
import type { VideoParams, VideoResponse, VideoErrorResponse } from "./models";

export default class VideoApi extends ApiImpl {
  path = "v2alpha/generation/image-to-video";

  generateVideo({
    seed = 0,
    cfg_scale = 1.8,
    motion_bucket_id = 127,
    image,
  }: VideoParams) {
    const formData = new FormData();
    formData.set("seed", seed.toString());
    formData.set("cfg_scale", cfg_scale.toString());
    formData.set("motion_bucket_id", motion_bucket_id.toString());
    formData.set("image", new Blob([image]));

    return this.axios.post<VideoResponse>(this.path, formData);
  }

  async getVideo(id: number) {
    const response = await this.axios.get(this.buildPath("/result", id), {
      responseType: "arraybuffer",
      headers: {
        Accept: "video/*",
      },
    });

    if (response.status === HttpStatusCode.Accepted) return null;

    if (response.status === HttpStatusCode.Ok)
      return Buffer.from(response.data);
  }
}
