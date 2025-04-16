import Home from "./page";
import { render, screen } from "@testing-library/react";
import { NotificationsContext } from "@/app/NotificationContext";
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

jest.mock("next/navigation", () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(), // mock the `push` method if needed
  }),
}));

it("renders layout with title and button", () => {
  render(
    <NotificationsContext.Provider value={mockedNotificationsContextValue}>
      <Home />
    </NotificationsContext.Provider>
  );

  expect(screen.getByText("Instances")).toBeInTheDocument();
  expect(screen.getByText("+ Create New Instance")).toBeInTheDocument();
});
