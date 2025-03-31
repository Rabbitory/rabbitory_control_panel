export interface FirewallRule {
  description: string;
  sourceIp: string;
  commonPorts: string[];
  customPorts: string;
}

export interface SecurityGroupRule {
  IpProtocol: string;
  FromPort: number;
  ToPort: number;
  IpRanges: { CidrIp: string; Description?: string }[];
}