export type ImageParams = {
  cfg_scale?: number;
  height?: number;
  width?: number;
  sample?: number;
  steps?: number;
  seed?: number;
  text_prompts: {
    text: string;
  }[];
};

export type ImageResponse = {
  artifacts: {
    base64: string;
    finishReason: "SUCCESS";
    seed: number;
  }[];
};

export type ImageError = {
  id: string;
  name: string;
  message: string;
};
