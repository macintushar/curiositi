import { BETTER_AUTH_SECRET } from "@/constants";
import * as crypto from "crypto";
import { tryCatch } from "@/lib/try-catch";

const ALGORITHM = "aes-256-cbc";

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(BETTER_AUTH_SECRET.padEnd(32).slice(0, 32)),
    iv,
  );

  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");

  return `${iv.toString("base64")}:${encrypted}`;
}

export async function decrypt(encryptedText: string): Promise<string> {
  const decryptPromise = async () => {
    const [ivBase64, encryptedData] = encryptedText.split(":");

    if (!ivBase64 || !encryptedData) {
      return "";
    }

    const iv = Buffer.from(ivBase64, "base64");
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(BETTER_AUTH_SECRET.padEnd(32).slice(0, 32)),
      iv,
    );

    let decrypted = decipher.update(encryptedData, "base64", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  };

  const { data, error } = await tryCatch(decryptPromise());

  if (error) {
    console.error("Decryption error:", error);
    return "";
  }

  return data;
}
