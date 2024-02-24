export type VideoParams = {
  image: Buffer;
  seed?: number | 0;
  cfg_scale?: number | 1.8;
  motion_bucket_id?: number | 127;
};

export type VideoResponse = {
  id: string;
};

export type VideoErrorResponse = {
  name: string;
  errors: string[];
};
