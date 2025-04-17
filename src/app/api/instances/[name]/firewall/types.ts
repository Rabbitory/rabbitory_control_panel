import { FirewallRule } from "@/types/firewall";

export interface UpdateFireWallRulesParams {
  region: string;
  rules: FirewallRule[];
  instanceName: string;
}
