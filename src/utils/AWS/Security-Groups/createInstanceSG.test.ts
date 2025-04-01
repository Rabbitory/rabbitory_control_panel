import {
  EC2Client,
  DescribeVpcsCommand,
  CreateSecurityGroupCommand,
  AuthorizeSecurityGroupIngressCommand,
} from "@aws-sdk/client-ec2";
import { createInstanceSG, getVpcId, initializeInstanceSG, authorizeIngressTraffic, generateUniqueSGName } from "./createInstanceSG";


jest.mock("@aws-sdk/client-ec2");
const mockSend = jest.fn();
(EC2Client as jest.Mock).mockImplementation(() => ({ send: mockSend }));

beforeEach(() => mockSend.mockClear());

// ============================
// Unit Tests for Internal Functions
// ============================

it("should return the default VPC ID if available", async () => {
  mockSend.mockResolvedValueOnce({ Vpcs: [{ VpcId: "vpc-123456", IsDefault: true }] });

  const client = new EC2Client({});
  const vpcId = await getVpcId(client);

  expect(vpcId).toBe("vpc-123456");
  expect(mockSend).toHaveBeenCalledWith(expect.any(DescribeVpcsCommand));
});

it("should return the first available VPC ID if no default VPC exists", async () => {
  mockSend.mockResolvedValueOnce({ Vpcs: [{ VpcId: "vpc-abcdef" }] });

  const client = new EC2Client({});
  const vpcId = await getVpcId(client);

  expect(vpcId).toBe("vpc-abcdef");
});

it("should throw an error if no VPCs are found", async () => {
  mockSend.mockResolvedValueOnce({ Vpcs: [] });

  const client = new EC2Client({});
  await expect(getVpcId(client)).rejects.toThrow("No VPCs found in the region.");
});

it("should generate a unique security group name", () => {
  expect(generateUniqueSGName("My Instance")).toBe("rabbitmq-sg-my-instance");
  expect(generateUniqueSGName("Instance@123!")).toBe("rabbitmq-sg-instance-123-");
});

it("should create a security group and return its ID", async () => {
  mockSend.mockResolvedValueOnce({ GroupId: "sg-12345" });

  const client = new EC2Client({});
  const sgId = await initializeInstanceSG("vpc-12345", client, "MyInstance");

  expect(sgId).toBe("sg-12345");
  expect(mockSend).toHaveBeenCalledWith(expect.any(CreateSecurityGroupCommand));
});

it("should throw an error if security group creation fails", async () => {
  mockSend.mockResolvedValueOnce({});

  const client = new EC2Client({});
  await expect(initializeInstanceSG("vpc-12345", client, "MyInstance")).rejects.toThrow("Security Group creation failed");
});

it("should authorize ingress traffic successfully", async () => {
  mockSend.mockResolvedValueOnce({});

  const client = new EC2Client({});
  await expect(authorizeIngressTraffic("sg-12345", client)).resolves.not.toThrow();

  expect(mockSend).toHaveBeenCalledWith(expect.any(AuthorizeSecurityGroupIngressCommand));
});

it("should throw an error if ingress traffic authorization fails", async () => {
  mockSend.mockRejectedValueOnce(new Error("AWS error"));

  const client = new EC2Client({});
  await expect(authorizeIngressTraffic("sg-12345", client)).rejects.toThrow("Failed to authorize ingress traffic");
});

// ============================
// Integration Test for createInstanceSG
// ============================

it("should create a security group and authorize ingress traffic end-to-end", async () => {
  mockSend.mockResolvedValueOnce({ Vpcs: [{ VpcId: "vpc-123456", IsDefault: true }] }); // getVpcId
  mockSend.mockResolvedValueOnce({ GroupId: "sg-78910" }); // initializeInstanceSG
  mockSend.mockResolvedValueOnce({}); // authorizeIngressTraffic

  const sgId = await createInstanceSG("MyInstance", "us-east-1");

  expect(sgId).toBe("sg-78910");
  expect(mockSend).toHaveBeenCalledTimes(3); // Ensure each API call was made

  // Optionally, you can check that the correct commands were invoked
  expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
    constructor: expect.objectContaining({
      name: 'DescribeVpcsCommand',
    }),
  }));

  expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
    constructor: expect.objectContaining({
      name: 'CreateSecurityGroupCommand',
    }),
  }));

  expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
    constructor: expect.objectContaining({
      name: 'AuthorizeSecurityGroupIngressCommand',
    }),
  }));
});