/**
 * @jest-environment node
 */

import { GET, POST } from "./route";

import { createMocks } from "node-mocks-http";
import { fetchInstance } from "@/utils/AWS/EC2/fetchInstance";
import { runSSMCommands } from "@/utils/AWS/SSM/runSSMCommands";
import { NextRequest } from "next/server";

jest.mock("@/utils/AWS/EC2/fetchInstace");
jest.mock("@/utils/AWS/SSM/runSSMCommands");

const mockedRunSSMCommands = jest.mocked(runSSMCommands);
const mockedFetchInstance = jest.mocked(fetchInstance);

it("GET returns configuration when instance is found and command succeeds", async () => {
  const dummyInstance = { InstanceId: "i-123456", PublicDnsName: "test.dns" };
  mockedFetchInstance.mockResolvedValueOnce(dummyInstance);

  const dummyFileContent = "heartbeat = 100\nchannel_max = 150\n";
  mockedRunSSMCommands.mockResolvedValueOnce(dummyFileContent);

  const { req: originalReq }: { req: NextRequest } = createMocks({
    method: "GET",
    url: "/api/instances/test-instance/configuration?region=us-east-1",
    headers: {
      "x-rabbitmq-username": "user", // required header
      "x-rabbitmq-password": "pass", // required header
    },
  });

  const req = {
    ...originalReq,
    headers: new Headers(originalReq.headers),
    nextUrl: new URL(originalReq.url, "http://localhost"),
  } as NextRequest;
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
  const { req: originalReq } = createMocks({
    method: "POST",
    url: "/api/instances/test-instance/configuration?region=us-east-1",
    body: { configuration: newConfig },
  });
  const req = {
    ...originalReq,
    nextUrl: new URL(originalReq.url, "http://localhost"),
  } as NextRequest;

  req.json = jest.fn().mockResolvedValueOnce({ configuration: newConfig });

  const params = Promise.resolve({ name: "test-instance" });

  const response = await POST(req, { params });
  const json = await response.json();

  expect(json).toEqual({ heartbeat: "120", channel_max: "200" });
});
