export type PluginList = string[];

export interface GetPluginsParams {
  instanceName: string;
  region: string;
  username: string;
  password: string;
}

export interface TogglePluginsParams {
  region: string;
  updates: PluginUpdate[];
  instanceName: string;
}

export interface PluginUpdate {
  name: string;
  enabled: boolean;
}
