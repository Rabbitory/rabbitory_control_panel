import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Instance } from "@/types/instance";
import ConfigurationPage from "./page";
import { InstanceContext } from "../InstanceContext";
import { NotificationsContext } from "@/app/NotificationContext";

import axios from "axios";

jest.mock("axios");
jest.mock("@/utils/validateConfig", () => ({
  validateConfiguration: jest.fn(() => []),
}));
window.HTMLElement.prototype.scrollIntoView = jest.fn();
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

const mockedNotificationsContextValue = {
  notifications: [],
  notificationsReady: true,
  setNotifications: jest.fn(),
  addNotification: jest.fn(),
  updateNotification: jest.fn(),
  clearNotifications: jest.fn(),
  deleteNotification: jest.fn(),
  formPending: () => false, // Provide a dummy implementation
  linkPending: () => false,
  instancePending: () => false,
  instanceTerminated: () => false,
  instanceCreated: () => false,
  instanceCreating: () => false,
};

beforeEach(() => {
  mockedAxios.get.mockReset();
  mockedAxios.post.mockReset();
});

it("renders configuration form with values", async () => {
  mockedAxios.get.mockResolvedValueOnce({ data: fakeConfigData });

  render(
    <NotificationsContext.Provider value={mockedNotificationsContextValue}>
      <InstanceContext.Provider
        value={{
          instance: fakeInstance,
          setInstance: jest.fn(),
        }}
      >
        <ConfigurationPage />
      </InstanceContext.Provider>
    </NotificationsContext.Provider>
  );

  expect(mockedAxios.get).toHaveBeenCalledTimes(1);

  await waitFor(() =>
    expect(
      screen.getByDisplayValue(String(fakeConfigData["heartbeat"]))
    ).toBeInTheDocument()
  );

  expect(
    screen.getByDisplayValue(String(fakeConfigData["channel_max"]))
  ).toBeInTheDocument();
});

it("handles form submission and updates configuration", async () => {
  mockedAxios.get.mockResolvedValueOnce({ data: fakeConfigData });

  const updatedConfig = { ...fakeConfigData, heartbeat: 20 };
  mockedAxios.post.mockResolvedValueOnce({ data: updatedConfig });

  render(
    <NotificationsContext.Provider value={mockedNotificationsContextValue}>
      <InstanceContext.Provider
        value={{
          instance: fakeInstance,
          setInstance: jest.fn(),
        }}
      >
        <ConfigurationPage />
      </InstanceContext.Provider>
    </NotificationsContext.Provider>
  );

  expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  await waitFor(() =>
    expect(
      screen.getByDisplayValue(String(fakeConfigData["heartbeat"]))
    ).toBeInTheDocument()
  );

  const user = userEvent.setup();

  const heartbeatInput = screen.getByRole("spinbutton", {
    name: /heartbeat/i,
  });

  await user.clear(heartbeatInput);
  await user.type(heartbeatInput, "20");

  const submitButton = screen.getByRole("button", {
    name: /save/i,
  });
  await user.click(submitButton);

  await waitFor(() => expect(mockedAxios.post).toHaveBeenCalledTimes(1));

  expect(screen.getByDisplayValue("20")).toBeInTheDocument();
});
