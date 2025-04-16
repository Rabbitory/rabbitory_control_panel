import { Instance } from "@aws-sdk/client-ec2";

export interface InstanceWithRegion extends Instance {
  region: string;
}
