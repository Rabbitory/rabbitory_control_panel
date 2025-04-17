export type PluginList = string[];

export interface GetPluginsParams {
  instanceName: string;
  region: string;
  username: string;
  password: string;
}

export interface TogglePluginsParams {
  region: string;
  pluginName: string;
  enabled: boolean;
  instanceName: string;
}
