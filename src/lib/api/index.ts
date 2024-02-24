import axios from "axios";
import VideoApi from "./video.api";
import ImageApi from "./image.api";

export class Api {
  private static mInstance?: Api;

  readonly video: VideoApi;
  readonly image: ImageApi;

  static get instance() {
    if (!this.mInstance) this.mInstance = new Api();

    return this.mInstance;
  }

  private constructor() {
    const axiosInstance = axios.create({
      baseURL: "https://api.stability.ai",
      headers: {
        Authorization: "Bearer " + process.env.STABILITY_API_KEY,
      },
    });

    this.image = new ImageApi(axiosInstance);
    this.video = new VideoApi(axiosInstance);
  }
}
