import { render, screen, waitFor } from "@testing-library/react";
import { Suspense } from "react";
import { StoragePage } from "./StoragePage";
import { NotificationsContext } from "@/app/NotificationContext";

import axios from "axios";

jest.mock("axios");
const mockedAxios = jest.mocked(axios);

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock("../InstanceContext", () => ({
  useInstanceContext: () => ({
    instance: {
      id: "i-1234567890",
      name: "test-instance",
      EBSVolumeId: "vol-1234567890",
      region: "us-east-1",
    },
  }),
}));

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

it("Fetches storage size", async () => {
  mockedAxios.get.mockImplementationOnce(
    () =>
      new Promise((resolve) =>
        setTimeout(() => resolve({ data: { size: 8 } }), 50)
      )
  );

  render(
    <NotificationsContext.Provider value={mockedNotificationsContextValue}>
      <Suspense fallback={<div>Suspense Fallback</div>}>
        <StoragePage />
      </Suspense>
    </NotificationsContext.Provider>
  );

  await waitFor(() =>
    expect(screen.queryByText(/Suspense Fallback/i)).not.toBeInTheDocument()
  );

  expect(await screen.findByText(/8 GB/i)).toBeInTheDocument();
});
