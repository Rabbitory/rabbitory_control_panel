import {
  EC2Client,
  DescribeVpcsCommand,
  CreateSecurityGroupCommand,
  AuthorizeSecurityGroupIngressCommand,
  AuthorizeSecurityGroupIngressCommandInput,
  IpPermission
} from "@aws-sdk/client-ec2";

export const getVpcId = async (client: EC2Client): Promise<string> => {
  try {
    const command = new DescribeVpcsCommand({});
    const response = await client.send(command);

    if (!response.Vpcs || response.Vpcs.length === 0) {
      throw new Error("No VPCs found in the region.");
    }

    const defaultVpc = response.Vpcs.find((vpc) => vpc.IsDefault);
    if (defaultVpc?.VpcId) {
      // Get the default VPC if available
      return defaultVpc.VpcId;
    } else if (!response.Vpcs[0].VpcId) {
      // Check if there is a first available VPC, if not throw error
      throw new Error("No VPC ID found in the first available VPC.");
    } else {
      // Fallback: Return the first available VPC
      return response.Vpcs[0].VpcId;
    }
  } catch (error) {
    throw new Error(`Failed to retrieve VPC ID\n${error instanceof Error ? error.message : String(error)}`);
  }
};

export const generateUniqueSGName = (instanceName: string): string => {
  return `rabbitmq-sg-${instanceName.replace(/[^a-zA-Z0-9-]/g, "-").toLowerCase()}`;
};

export const initializeInstanceSG = async (vpcId: string, client: EC2Client, instanceName: string): Promise<string> => {
  try {
    const securityGroupName = generateUniqueSGName(instanceName);
    const description = `Security group for RMQ EC2 Instance: ${instanceName}`;

    const createSGCommand = new CreateSecurityGroupCommand({
      GroupName: securityGroupName,
      Description: description,
      VpcId: vpcId,
    });

    const createSGResponse = await client.send(createSGCommand);
    if (!createSGResponse.GroupId) throw new Error("Security Group creation failed");
    return createSGResponse.GroupId;
  } catch (error) {
    throw new Error(`Failed to create security group\n${error instanceof Error ? error.message : String(error)}`);
  }
};

export const authorizeIngressTraffic = async (
  securityGroupId: string,
  client: EC2Client
): Promise<void> => {
  try {
    const ingressRules: IpPermission[] = [
      {
        IpProtocol: "tcp",
        FromPort: 5672,
        ToPort: 5672,
        IpRanges: [{ CidrIp: "0.0.0.0/0" }],
      },
      {
        IpProtocol: "tcp",
        FromPort: 15672,
        ToPort: 15672,
        IpRanges: [{ CidrIp: "0.0.0.0/0" }],
      },
      {
        IpProtocol: "tcp",
        FromPort: 80,
        ToPort: 80,
        IpRanges: [{ CidrIp: "0.0.0.0/0" }],
      },
      {
        IpProtocol: "tcp",
        FromPort: 443,
        ToPort: 443,
        IpRanges: [{ CidrIp: "0.0.0.0/0" }],
      },
      {
        IpProtocol: "tcp",
        FromPort: 22,
        ToPort: 22,
        IpRanges: [{ CidrIp: "0.0.0.0/0" }],
      },
    ];

    const params: AuthorizeSecurityGroupIngressCommandInput = {
      GroupId: securityGroupId,
      IpPermissions: ingressRules,
    };

    const authorizeIngressCommand = new AuthorizeSecurityGroupIngressCommand(params);
    await client.send(authorizeIngressCommand);
  } catch (error) {
    throw new Error(`Failed to authorize ingress traffic\n${error instanceof Error ? error.message : String(error)}`);
  }
};

export const createInstanceSG = async (instanceName: string, region: string): Promise<string> => {
  const client = new EC2Client({ region: region });

  try {
    const vpcId = await getVpcId(client);
    const securityGroupId = await initializeInstanceSG(vpcId, client, instanceName);
    await authorizeIngressTraffic(securityGroupId, client);
    return securityGroupId;
  } catch (err) {
    throw new Error(`Error setting up Rabbitory security group\n${err instanceof Error ? err.message : String(err)}`);
  }
};