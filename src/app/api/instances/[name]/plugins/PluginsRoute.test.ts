/**
 * @jest-environment node
 */

import { GET, POST } from "./route";
import axios from "axios";
import { createMocks } from "node-mocks-http";
import { fetchInstance } from "@/utils/AWS/EC2/fetchInstace";
import { runSSMCommands } from "@/utils/AWS/SSM/runSSMCommands";

jest.mock("axios");
jest.mock("@/utils/AWS/EC2/fetchInstace");
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
  const { req }: { req: Request } = createMocks({
    method: "GET",
    url: "/api/instances/test-instance/plugins",
  });
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
  const { req } = createMocks({
    method: "POST",
    url: "/api/instances/test-instance/plugins",
    body: payload,
  });

  req.json = jest.fn().mockResolvedValueOnce(payload);

  const params = Promise.resolve({ name: "test-instance" });

  const response = await POST(req, { params });
  const json = await response.json();

  expect(json).toEqual({ message: "Plugin update successful" });
});
