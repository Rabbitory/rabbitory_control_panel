import { render, screen, waitFor } from "@testing-library/react";
import { Suspense } from "react";
import StorageEditPage from "./page";

import axios from "axios";

jest.mock("axios");
const mockedAxios = jest.mocked(axios);

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock("../../../InstanceContext", () => ({
  useInstanceContext: () => ({
    instance: {
      id: "i-1234567890",
      name: "test-instance",
      EBSVolumeId: "vol-1234567890",
      region: "us-east-1",
    },
  }),
}));

it("Fetches storage size", async () => {
  mockedAxios.get.mockImplementationOnce(
    () =>
      new Promise((resolve) =>
        setTimeout(() => resolve({ data: { size: 8 } }), 50),
      ),
  );

  render(
    <Suspense fallback={<div>Suspense Fallback</div>}>
      <StorageEditPage />
    </Suspense>,
  );

  await waitFor(() =>
    expect(screen.queryByText(/Suspense Fallback/i)).not.toBeInTheDocument(),
  );

  expect(await screen.findByText(/8 GB/i)).toBeInTheDocument();
});
