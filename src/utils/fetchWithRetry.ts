import axios from "axios";
interface Options {
  auth: {
    username: string;
    password: string;
  };
}
export async function fetchWithRetry(
  url: string,
  options: Options,
  retries = 3,
  delay = 2000,
) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, options);
      return response;
    } catch (error: unknown) {
      if (i === retries - 1) throw error;

      if (axios.isAxiosError(error) && error.code === "ECONNREFUSED") {
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}
