import { _InstanceType } from "@aws-sdk/client-ec2";

export interface Instance {
  name: string;
  id: string;
  type: _InstanceType;
  publicDns: string;
  launchTime: string;
  region: string;
  port: number;
  user: string;
  password: string;
  endpointUrl: string;
  state: string;
  EBSVolumeId: string;
}
