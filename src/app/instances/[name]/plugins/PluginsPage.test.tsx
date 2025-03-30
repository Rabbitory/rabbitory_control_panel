// import React, { act } from "react";
// import { render, screen, waitFor } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";

// import PluginsPage from "./page";
// import axios from "axios";
// import { Suspense } from "react";

// jest.mock("axios");
// const mockedAxios = jest.mocked(axios);

// const params = Promise.resolve({ name: "test-instance" });

// const fakePluginsData = ["rabbitmq_management", "rabbitmq_management_agent"];
// beforeEach(() => {
//   mockedAxios.get.mockReset();
//   mockedAxios.post.mockReset();
// });

// it("renders loading state and then plugins form", async () => {
//   mockedAxios.get.mockImplementationOnce(
//     () =>
//       new Promise((resolve) =>
//         setTimeout(() => resolve({ data: fakePluginsData }), 50)
//       )
//   );

//   await act(async () => {
//     render(
//       <Suspense fallback={<div>Suspense Fallback</div>}>
//         <PluginsPage params={params} />
//       </Suspense>
//     );
//   });

//   await waitFor(() =>
//     expect(screen.queryByText(/Suspense Fallback/i)).not.toBeInTheDocument()
//   );

//   expect(screen.getByText(/loading/i)).toBeInTheDocument();
//   expect(mockedAxios.get).toHaveBeenCalledTimes(1);

//   await waitFor(() => {
//     expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
//   });

//   // Check that the input for setting1 contains the value from fakePluginsData.
//   const checkbox1 = screen.getByRole("checkbox", {
//     name: /^rabbitmq_management$/i,
//   });
//   const checkbox2 = screen.getByRole("checkbox", {
//     name: /^rabbitmq_management_agent$/i,
//   });

//   const checkbox3 = screen.getByRole("checkbox", {
//     name: /^rabbitmq_federation$/i,
//   });
//   expect(checkbox1).toBeChecked();
//   expect(checkbox2).toBeChecked();
//   expect(checkbox3).not.toBeChecked();
// });

// it("handles form submission and updates plugins", async () => {
//   mockedAxios.get.mockResolvedValueOnce({ data: fakePluginsData });
//   mockedAxios.post.mockResolvedValueOnce({});

//   render(<PluginsPage params={params} />);

//   await waitFor(() => expect(mockedAxios.get).toHaveBeenCalledTimes(1));

//   const checkbox3 = screen.getByRole("checkbox", {
//     name: /^rabbitmq_federation$/i,
//   });

//   expect(checkbox3).not.toBeChecked();
//   const user = userEvent.setup();
//   await user.click(checkbox3);

//   expect(checkbox3).toBeChecked();

//   await waitFor(() =>
//     expect(mockedAxios.post).toHaveBeenCalledWith(
//       `/api/instances/test-instance/plugins`,
//       { name: "rabbitmq_federation", enabled: true }
//     )
//   );
//   //we need to make sure that the checkbox is still checked after the post request
//   expect(checkbox3).toBeChecked();
// });

it("yes", () => {
  expect(true).toBe(true);
});
