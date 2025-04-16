import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InstanceContext } from "../InstanceContext";
import PluginsPage from "./page";
import axios from "axios";
import { Instance } from "@/types/instance";
import { NotificationsContext } from "@/app/NotificationContext";

jest.mock("axios");

const mockedAxios = jest.mocked(axios);

const fakePluginsData = ["rabbitmq_management", "rabbitmq_management_agent"];
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
  instanceCreated: () => false,
  instanceCreating: () => false,
  instanceTerminated: () => false,
};
beforeEach(() => {
  mockedAxios.get.mockReset();
  mockedAxios.post.mockReset();
});

it("renders plugins form", async () => {
  mockedAxios.get.mockResolvedValueOnce({ data: fakePluginsData });

  render(
    <NotificationsContext.Provider value={mockedNotificationsContextValue}>
      <InstanceContext.Provider
        value={{
          instance: fakeInstance,
          setInstance: jest.fn(),
        }}
      >
        <PluginsPage />
      </InstanceContext.Provider>
    </NotificationsContext.Provider>
  );

  expect(mockedAxios.get).toHaveBeenCalledTimes(1);

  await screen.findByRole("checkbox", {
    name: /^rabbitmq_management$/i,
  });

  const checkbox1 = screen.getByRole("checkbox", {
    name: /^rabbitmq_management$/i,
  });
  const checkbox2 = screen.getByRole("checkbox", {
    name: /^rabbitmq_management_agent$/i,
  });

  const checkbox3 = screen.getByRole("checkbox", {
    name: /^rabbitmq_federation$/i,
  });
  expect(checkbox1).toBeChecked();
  expect(checkbox2).toBeChecked();
  expect(checkbox3).not.toBeChecked();
});

it("handles form submission and updates plugins", async () => {
  mockedAxios.get.mockResolvedValueOnce({ data: fakePluginsData });
  mockedAxios.post.mockResolvedValueOnce({});

  render(
    <NotificationsContext.Provider value={mockedNotificationsContextValue}>
      <InstanceContext.Provider
        value={{
          instance: fakeInstance,
          setInstance: jest.fn(),
        }}
      >
        <PluginsPage />
      </InstanceContext.Provider>
    </NotificationsContext.Provider>
  );

  await waitFor(() => expect(mockedAxios.get).toHaveBeenCalledTimes(1));

  const checkbox3 = screen.getByRole("checkbox", {
    name: /^rabbitmq_federation$/i,
  });

  expect(checkbox3).not.toBeChecked();
  const user = userEvent.setup();
  await user.click(checkbox3);

  expect(checkbox3).toBeChecked();

  await waitFor(() =>
    expect(mockedAxios.post).toHaveBeenCalledWith(
      `/api/instances/test-instance/plugins?region=${fakeInstance.region}`,
      { name: "rabbitmq_federation", enabled: true }
    )
  );
  //we need to make sure that the checkbox is still checked after the post request
  expect(checkbox3).toBeChecked();
});
