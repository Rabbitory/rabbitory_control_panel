export interface GetBackupsParams {
  region: string;
  instanceName: string;
}

export interface AddBackupsParams extends GetBackupsParams {
  username: string;
  password: string;
}
