import axios from "axios";
interface Options {
  auth: {
    username: string;
    password: string;
  };
}

const isRetryable = (err: unknown): boolean => {
  if (!axios.isAxiosError(err)) return false;
  const code = err.code;
  const status = err.response?.status;
  return (
    code === "ECONNREFUSED" ||
    code === "ECONNABORTED" ||
    (status != null && status >= 500 && status < 600)
  );
};
export async function fetchWithRetry(
  url: string,
  options: Options,
  retries = 5,
  delay = 2000
) {
  let lastError: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, options);

      return response;
    } catch (error: unknown) {
      lastError = error;
      if (i === retries || !isRetryable(error)) {
        throw error;
      }

      await new Promise((res) => setTimeout(res, delay));
    }
  }
  throw lastError;
}
