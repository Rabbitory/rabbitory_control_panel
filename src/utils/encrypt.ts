// import * as argon2 from "argon2";

// const encrypt = async (data: string): Promise<string | null> => {
//   try {
//     return await argon2.hash(data);
//   } catch (err) {
//     console.error("Error encrypting data:", err);
//     return null;
//   }
// }

// export default encrypt;
import crypto from "crypto";

const algorithm = "aes-256-cbc";

const secretKey =
  process.env.ENCRYPTION_SECRET || "your_default_secret_key_here";
const key = crypto
  .createHash("sha256")
  .update(String(secretKey))
  .digest()
  .slice(0, 32);

export const encrypt = (text: string): string => {
  // Create a random Initialization Vector.
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);

  return iv.toString("hex") + ":" + encrypted.toString("hex");
};

export const decrypt = (encryptedText: string): string => {
  const textParts = encryptedText.split(":");
  const iv = Buffer.from(textParts.shift() as string, "hex");
  const encrypted = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
};
