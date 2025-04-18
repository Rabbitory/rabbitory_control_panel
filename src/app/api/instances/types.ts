import { Instance } from "@aws-sdk/client-ec2";

export interface InstanceWithRegion extends Instance {
  region: string;
}

export interface FormattedInstance {
  name: string;
  id?: string;
  region: string;
  state?: string;
}
