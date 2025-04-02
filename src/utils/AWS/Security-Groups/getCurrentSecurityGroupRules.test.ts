import { EC2Client, DescribeSecurityGroupsCommand } from "@aws-sdk/client-ec2";
import { getCurrentSecurityGroupRules } from "./getCurrentSecurityGroupRules";
import { fetchInstance } from "../EC2/fetchInstance";
import { convertIpPermissionsToSecurityGroupRules } from "@/utils/AWS/Security-Groups/conversionsForSG";

jest.mock("../EC2/fetchInstance", () => ({
  fetchInstance: jest.fn(),
}));

jest.mock("@aws-sdk/client-ec2", () => {
  return {
    EC2Client: jest.fn().mockImplementation(() => ({
      send: jest.fn(),
    })),
    DescribeSecurityGroupsCommand: jest.fn(),
  };
});

jest.mock("@/utils/AWS/EC2/getInstanceAvailabilityZone", () => ({
  getInstanceAvailabilityZone: jest.fn(),
}));

jest.mock("@/utils/AWS/Security-Groups/conversionsForSG", () => ({
  convertIpPermissionsToSecurityGroupRules: jest.fn(),
}));

const mockSend = jest.fn();

beforeEach(() => {
  mockSend.mockClear();
  (fetchInstance as jest.Mock).mockClear();
  (EC2Client as jest.Mock).mockImplementation(() => ({ send: mockSend }));
  (convertIpPermissionsToSecurityGroupRules as jest.Mock).mockClear(); // Reset mock state
});

it("should return the security group rules for an instance", async () => {
  const mockInstance = {
    SecurityGroups: [{ GroupId: "sg-12345" }],
  };

  const mockSecurityGroup = {
    GroupId: "sg-12345",
    IpPermissions: [
      {
        IpProtocol: "tcp",
        FromPort: 22,
        ToPort: 22,
        IpRanges: [{ CidrIp: "0.0.0.0/0", Description: "SSH access" }],
      },
    ],
  };

  const mockConvertedRules = [{ rule: "dummy-rule" }];
  (fetchInstance as jest.Mock).mockResolvedValue(mockInstance);
  mockSend.mockResolvedValueOnce({ SecurityGroups: [mockSecurityGroup] });
  (convertIpPermissionsToSecurityGroupRules as jest.Mock).mockReturnValue(mockConvertedRules);
  const securityGroupRules = await getCurrentSecurityGroupRules("my-instance");

  expect(securityGroupRules).toEqual(mockConvertedRules);
  expect(fetchInstance).toHaveBeenCalledWith("my-instance", expect.objectContaining({ send: expect.any(Function) }));

  expect(mockSend).toHaveBeenCalledWith(expect.any(DescribeSecurityGroupsCommand));
  expect(convertIpPermissionsToSecurityGroupRules).toHaveBeenCalledWith(mockSecurityGroup.IpPermissions);
});
