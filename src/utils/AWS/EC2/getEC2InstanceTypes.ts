import {
  EC2Client,
  DescribeInstanceTypesCommand,
  DescribeInstanceTypesCommandOutput,
} from "@aws-sdk/client-ec2";
import { getVCPULimit } from "./getVCPULimit";

const ec2Client = new EC2Client({ region: process.env.REGION });

export async function getEC2InstanceTypes(
  architecture: "all" | "arm64" | "amd64" = "all",
): Promise<Record<string, string[]>> {
  let types: string[] = [];

  const armTypes = ["m8g.*", "m7g.*", "c8g.*", "c7gn.*", "r8g.*"];
  const amdTypes = ["t2.micro", "t2.small"];

  if (architecture === "all") {
    types = [...armTypes, ...amdTypes];
  } else if (architecture === "arm64") {
    types = armTypes;
  } else if (architecture === "amd64") {
    types = amdTypes;
  }

  try {
    const allSpecifiedInstanceTypes: string[] = [];
    let nextToken: string | undefined = undefined;
    const region = process.env.REGION || "us-east-1";
    // Fetch vCPU limit once before the loop
    const vCPULimit = (await getVCPULimit(region)) || 32;

    do {
      const command = new DescribeInstanceTypesCommand({
        Filters: [
          {
            Name: "instance-type",
            Values: types,
          },
        ],
        NextToken: nextToken,
      });

      const response: DescribeInstanceTypesCommandOutput =
        await ec2Client.send(command);

      if (response.InstanceTypes) {
        allSpecifiedInstanceTypes.push(
          ...response.InstanceTypes.filter(
            (type) =>
              type.InstanceType &&
              type.VCpuInfo?.DefaultVCpus &&
              type.VCpuInfo.DefaultVCpus <= vCPULimit,
          ).map((type) => type.InstanceType!),
        );
      }

      nextToken = response.NextToken;
    } while (nextToken);

    let prefixes: string[] = [];
    if (architecture === "all") {
      prefixes = ["m8g", "m7g", "c8g", "c7gn", "r8g", "t2"];
    } else if (architecture === "arm64") {
      prefixes = ["m8g", "m7g", "c8g", "c7gn", "r8g"];
    } else if (architecture === "amd64") {
      prefixes = ["t2"];
    }

    const validPrefixes = prefixes.filter((prefix) =>
      allSpecifiedInstanceTypes.some((type) => type.startsWith(prefix)),
    );

    const allowedInstanceTypes: Record<string, string[]> = {};
    validPrefixes.forEach((prefix) => {
      allowedInstanceTypes[prefix] = allSpecifiedInstanceTypes.filter((type) =>
        type.startsWith(prefix),
      );
    });

    return allowedInstanceTypes;
  } catch (error) {
    console.error("Error fetching instance types:", error);
    return {};
  }
}
