import type { AxiosInstance } from "axios";

export abstract class ApiImpl {
  abstract path: string;

  constructor(protected readonly axios: AxiosInstance) {}

  buildPath(...values: any[]) {
    return this.path + values.join("/");
  }
}
