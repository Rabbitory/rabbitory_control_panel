/**
 * @jest-environment node
 */
import { GET, POST } from "./route";
import axios from "axios";
import { createMocks } from "node-mocks-http";
import { fetchInstance } from "@/utils/AWS/EC2/fetchInstance";
import { runSSMCommands } from "@/utils/AWS/SSM/runSSMCommands";
import { NextRequest } from "next/server";

jest.mock("axios");
jest.mock("@/utils/AWS/EC2/fetchInstance");
jest.mock("@/utils/AWS/SSM/runSSMCommands");

const mockedAxios = jest.mocked(axios);
const mockedRunSSMCommands = jest.mocked(runSSMCommands);
const mockedFetchInstance = jest.mocked(fetchInstance);

it("returns enabled plugins when instance is found and axios call succeeds", async () => {
  const dummyInstance = {
    PublicDnsName: "test.dns",
  };
  mockedFetchInstance.mockResolvedValueOnce(dummyInstance);

  const dummyEnabledPlugins = [
    "rabbitmq_management",
    "rabbitmq_management_agent",
  ];
  mockedAxios.get.mockResolvedValueOnce({
    data: [{ enabled_plugins: dummyEnabledPlugins }],
  });

  //simulate a request to the route
  const { req: originalReq }: { req: NextRequest } = createMocks({
    method: "GET",
    url: "/api/instances/test-instance/plugins?region=us-east-1",
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

  expect(json).toEqual(dummyEnabledPlugins);
});

it("sends SSM commands and returns success message when plugin update succeeds", async () => {
  const dummyInstance = { InstanceId: "i-123456", PublicDnsName: "test.dns" };
  mockedFetchInstance.mockResolvedValueOnce(dummyInstance);
  mockedRunSSMCommands.mockResolvedValueOnce("test-stdout");

  const payload = { name: "rabbitmq_management", enabled: true };
  const { req: originalReq } = createMocks({
    method: "POST",
    url: "/api/instances/test-instance/plugins?region=us-east-1",
    body: payload,
  });
  const req = {
    ...originalReq,
    nextUrl: new URL(originalReq.url, "http://localhost"),
  } as NextRequest;

  req.json = jest.fn().mockResolvedValueOnce(payload);

  const params = Promise.resolve({ name: "test-instance" });

  const response = await POST(req, { params });
  const json = await response.json();

  expect(json).toEqual({ message: "Plugin update successful" });
});
