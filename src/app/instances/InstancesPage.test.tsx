import Home from "./page";
import { render, screen } from "@testing-library/react";
// import "@testing-library/jest-dom";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(), // mock the `push` method if needed
  }),
}));

it("renders layout with title and button", () => {
  render(<Home />);

  expect(screen.getByText("Instances")).toBeInTheDocument();
  expect(screen.getByText("Create New Instance")).toBeInTheDocument();
});
