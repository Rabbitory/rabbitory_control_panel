/**
 * @jest-environment node
 */

import { GET, POST } from "./route";

import { createMocks } from "node-mocks-http";
import { fetchInstance } from "@/utils/AWS/EC2/fetchInstace";
import { runSSMCommands } from "@/utils/AWS/SSM/runSSMCommands";

jest.mock("@/utils/AWS/EC2/fetchInstace");
jest.mock("@/utils/AWS/SSM/runSSMCommands");

const mockedRunSSMCommands = jest.mocked(runSSMCommands);
const mockedFetchInstance = jest.mocked(fetchInstance);

it("GET returns configuration when instance is found and command succeeds", async () => {
  const dummyInstance = { InstanceId: "i-123456", PublicDnsName: "test.dns" };
  mockedFetchInstance.mockResolvedValueOnce(dummyInstance);

  const dummyFileContent = "heartbeat = 100\nchannel_max = 150\n";
  mockedRunSSMCommands.mockResolvedValueOnce(dummyFileContent);

  const { req } = createMocks({
    method: "GET",
    url: "/api/instances/test-instance/configuration",
  });

  const params = Promise.resolve({ name: "test-instance" });

  const response = await GET(req, { params });
  const json = await response.json();

  expect(json).toEqual({ heartbeat: "100", channel_max: "150" });
});

it("POST returns configuration after a successful update", async () => {
  const newConfig = { heartbeat: "120", channel_max: "200" };

  const dummyInstance = { InstanceId: "i-123456", PublicDnsName: "test.dns" };
  mockedFetchInstance.mockResolvedValueOnce(dummyInstance);

  const dummyOutput =
    "some output__CONFIG_START__heartbeat = 120\nchannel_max = 200\n";
  mockedRunSSMCommands.mockResolvedValueOnce(dummyOutput);

  // Create a minimal mock request with a JSON payload.
  const { req } = createMocks({
    method: "POST",
    url: "/api/instances/test-instance/configuration",
    body: { configuration: newConfig },
  });

  req.json = jest.fn().mockResolvedValueOnce({ configuration: newConfig });

  const params = Promise.resolve({ name: "test-instance" });

  const response = await POST(req, { params });
  const json = await response.json();

  expect(json).toEqual({ heartbeat: "120", channel_max: "200" });
});
