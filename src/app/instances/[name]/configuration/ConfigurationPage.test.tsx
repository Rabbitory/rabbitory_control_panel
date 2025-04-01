import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Instance } from "@/types/instance";
import ConfigurationPage from "./page";
import { InstanceContext } from "../InstanceContext";
import axios from "axios";

jest.mock("axios");
const mockedAxios = jest.mocked(axios);

const fakeConfigData = {
  heartbeat: 100,
  channel_max: 150,
};
const fakeInstance: Instance = {
  id: "i-123456",
  publicDns: "test.dns",
  type: "t2.micro",
  region: "us-east-1",
  name: "test-instance",
  launchTime: "2023-10-01T00:00:00Z",
  port: 5672,
  user: "blackfries",
  password: "blackfries",
  endpointUrl: "test.dns:5672",
  state: "running",
  EBSVolumeId: "vol-123456",
};

beforeEach(() => {
  mockedAxios.get.mockReset();
  mockedAxios.post.mockReset();
});

it("renders loading state and then configuration form", async () => {
  //Simulate a delay in the response so that we can test the loading state.
  mockedAxios.get.mockImplementationOnce(
    () =>
      new Promise((resolve) =>
        setTimeout(() => resolve({ data: fakeConfigData }), 50)
      )
  );

  render(
    <InstanceContext.Provider
      value={{
        instance: fakeInstance,
        setInstance: jest.fn(),
      }}
    >
      <ConfigurationPage />
    </InstanceContext.Provider>
  );

  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  expect(mockedAxios.get).toHaveBeenCalledTimes(1);

  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });

  // Check that the input for setting1 contains the value from fakeConfigData.
  const setting1Input = screen.getByDisplayValue(fakeConfigData["heartbeat"]);
  const setting2Input = screen.getByDisplayValue(fakeConfigData["channel_max"]);
  expect(setting1Input).toBeInTheDocument();
  expect(setting2Input).toBeInTheDocument();
});

it("handles form submission and updates configuration", async () => {
  mockedAxios.get.mockResolvedValueOnce({ data: fakeConfigData });

  const updatedConfig = { ...fakeConfigData, heartbeat: 20 };
  mockedAxios.post.mockResolvedValueOnce({ data: updatedConfig });

  render(
    <InstanceContext.Provider
      value={{
        instance: fakeInstance,
        setInstance: jest.fn(),
      }}
    >
      <ConfigurationPage />
    </InstanceContext.Provider>
  );

  await waitFor(() => expect(mockedAxios.get).toHaveBeenCalledTimes(1));

  const user = userEvent.setup();

  const heartbeatInput = screen.getByRole("spinbutton", {
    name: /heartbeat/i,
  });

  await user.clear(heartbeatInput);
  await user.type(heartbeatInput, "20");

  const submitButton = screen.getByRole("button", {
    name: /save configuration/i,
  });
  await user.click(submitButton);

  await waitFor(() => expect(mockedAxios.post).toHaveBeenCalledTimes(1));

  expect(screen.getByDisplayValue("20")).toBeInTheDocument();
});
