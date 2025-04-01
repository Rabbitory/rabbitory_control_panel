import axios from "axios";

type Definitions = Record<string, unknown>;

function attachTimeAndVersion(definitions: Definitions, trigger = "auto") {
  try {
    const timestamp = new Date().toISOString();
    const formattedDate = timestamp
      .replace("T", " ")
      .replace(/\.\d+Z$/, " +0000");
    const version = definitions.rabbitmq_version as string;
    return {
      rabbitmq_version: version,
      timestamp: formattedDate,
      trigger,
      definitions,
    };
  } catch (error) {
    console.error("Error parsing definitions:", error);
    return;
  }
}

export async function getDefinitions(
  publicDns: string,
  username: string,
  password: string,
  trigger = "auto"
) {
  const rabbitUrl = `http://${publicDns}:15672/api/definitions`;
  try {
    const response = await axios.get(rabbitUrl, {
      auth: {
        username,
        password,
      },
    });
    const definitions = attachTimeAndVersion(response.data, trigger);
    return definitions;
  } catch (error) {
    console.error("Error fetching definitions:", error);
    throw new Error("Error fetching definitions");
  }
}
