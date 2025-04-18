export interface GetConfigurationParams {
  region: string;
  instanceName: string;
}

export interface UpdateConfigurationParams {
  region: string;
  newConfig: Config;
  instanceName: string;
}
export type Config = Record<string, string>;
