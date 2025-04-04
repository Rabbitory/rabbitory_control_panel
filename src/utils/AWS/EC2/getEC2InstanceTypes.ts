import { 
  EC2Client, 
  DescribeInstanceTypesCommand, 
  DescribeInstanceTypesCommandOutput 
} from "@aws-sdk/client-ec2";

const ec2Client = new EC2Client({ region: process.env.REGION });

export async function getEC2InstanceTypes(): Promise<Record<string, string[]>> {
  try {
    const allSpecifiedInstanceTypes: string[] = [];
    let nextToken: string | undefined = undefined;

    do {
      const command = new DescribeInstanceTypesCommand({
        Filters: [
          {
            Name: "instance-type",
            Values: ["m8g.*", "m7g.*", "c8g.*", "c7gn.*", "r8g.*", "t2.*"],
          },
        ],
        NextToken: nextToken,
      });

      const response: DescribeInstanceTypesCommandOutput = await ec2Client.send(command);

      if (response.InstanceTypes) {
        allSpecifiedInstanceTypes.push(
          ...response.InstanceTypes.map((type) => type.InstanceType ?? "")
        );
      }

      nextToken = response.NextToken;
    } while (nextToken);

    const allowedInstanceTypes: Record<string, string[]> = {
      m8g: allSpecifiedInstanceTypes.filter((type) => type.startsWith("m8g")),
      m7g: allSpecifiedInstanceTypes.filter((type) => type.startsWith("m7g")),
      c8g: allSpecifiedInstanceTypes.filter((type) => type.startsWith("c8g")),
      c7gn: allSpecifiedInstanceTypes.filter((type) => type.startsWith("c7gn")),
      r8g: allSpecifiedInstanceTypes.filter((type) => type.startsWith("r8g")),
      t2: allSpecifiedInstanceTypes.filter((type) => type.startsWith("t2")),
    };

    return allowedInstanceTypes;
  } catch (error) {
    console.error("Error fetching instance types:", error);
    return {};
  }
}