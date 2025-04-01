import { EC2Client, DescribeSecurityGroupsCommand } from "@aws-sdk/client-ec2";
import { getCurrentSecurityGroupRules } from "./getCurrentSecurityGroupRules";
import { fetchInstance } from "../EC2/fetchInstance";

jest.mock("../EC2/fetchInstance", () => ({
  fetchInstance: jest.fn(),
}));

jest.mock("@aws-sdk/client-ec2", () => {
  return {
    EC2Client: jest.fn().mockImplementation(() => {
      return { send: jest.fn() }; // Mock the send method
    }),
    DescribeSecurityGroupsCommand: jest.fn(),
  };
});

const mockSend = jest.fn();
beforeEach(() => {
  mockSend.mockClear();
  (fetchInstance as jest.Mock).mockClear();
  (EC2Client as jest.Mock).mockImplementation(() => ({ send: mockSend }));
});

it("should return the security group for an instance", async () => {
  const mockInstance = {
    SecurityGroups: [{ GroupId: "sg-12345" }],
  };
  const mockSecurityGroup = {
    GroupId: "sg-12345",
    GroupName: "my-security-group",
    Description: "My custom security group",
    VpcId: "vpc-0a1b2c3d4e5f67890",
    IpPermissions: [
      {
        IpProtocol: "tcp",
        FromPort: 22,
        ToPort: 22,
        IpRanges: [{ CidrIp: "0.0.0.0/0", Description: "SSH access" }],
      },
    ],
    IpPermissionsEgress: [
      {
        IpProtocol: "-1",
        IpRanges: [{ CidrIp: "0.0.0.0/0", Description: "All outbound traffic" }],
      },
    ],
    Tags: [{ Key: "Environment", Value: "Production" }],
  };

  (fetchInstance as jest.Mock).mockResolvedValue(mockInstance);
  mockSend.mockResolvedValueOnce({ SecurityGroups: [mockSecurityGroup] });

  const client = new EC2Client({});
  const securityGroup = await getCurrentSecurityGroupRules("my-instance");

  expect(securityGroup).toEqual(mockSecurityGroup);
  expect(fetchInstance).toHaveBeenCalledWith("my-instance", client);
  expect(mockSend).toHaveBeenCalledWith(expect.any(DescribeSecurityGroupsCommand));
});


it("should throw an error if no security group is found", async () => {
  const mockInstance = { SecurityGroups: [] };

  (fetchInstance as jest.Mock).mockResolvedValue(mockInstance);

  const client = new EC2Client({});
  await expect(getCurrentSecurityGroupRules("my-instance")).rejects.toThrow("No security groups found for the instance.");

  expect(fetchInstance).toHaveBeenCalledWith("my-instance", client);
});

it("should throw an error if no security group details are found", async () => {
  const mockInstance = { SecurityGroups: [{ GroupId: "sg-12345" }] };
  (fetchInstance as jest.Mock).mockResolvedValue(mockInstance);
  mockSend.mockResolvedValueOnce({ SecurityGroups: [] });

  const client = new EC2Client({});
  await expect(getCurrentSecurityGroupRules("my-instance")).rejects.toThrow("No security group details found.");
  
  expect(fetchInstance).toHaveBeenCalledWith("my-instance", client);
  expect(mockSend).toHaveBeenCalledWith(expect.any(DescribeSecurityGroupsCommand));
});
