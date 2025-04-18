export function parseConfig(
  config: { [key: string]: string },
  fileContent: string
): void {
  fileContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const [key, ...rest] = trimmed.split("=");
    if (!key || rest.length === 0) return;
    const value = rest
      .join("=")
      .trim()
      .replace(/^['"]|['"]$/g, "");
    config[key.trim()] = value;
  });
}
