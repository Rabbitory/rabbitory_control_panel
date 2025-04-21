export interface GetVersionsParams {
  instanceName: string;
  region: string;
  username: string;
  password: string;
}

export type Versions = {
  rabbitmq_version: string;
  erlang_version: string;
};
