import db from "@/db";
import { user } from "@/db/schema";
import { LLM_PROVIDERS } from "@/types";
import { encrypt, decrypt } from "@/lib/crypto";
import { eq } from "drizzle-orm";

export async function addOrUpdateApiKey(
  userId: string,
  provider: LLM_PROVIDERS,
  updateValue: { apiKey: string; url: string },
) {
  try {
    let updated = false;

    const encryptedKey = encrypt(updateValue.apiKey);

    switch (provider) {
      case LLM_PROVIDERS.OLLAMA:
        await db
          .update(user)
          .set({ ollamaUrl: updateValue.url })
          .where(eq(user.id, userId));

        updated = true;

        break;

      case LLM_PROVIDERS.OPENAI:
        await db
          .update(user)
          .set({ openaiApiKey: encryptedKey })
          .where(eq(user.id, userId));

        updated = true;

        break;

      case LLM_PROVIDERS.OPENROUTER:
        await db
          .update(user)
          .set({ openRouterApiKey: encryptedKey })
          .where(eq(user.id, userId));

        updated = true;

        break;

      case LLM_PROVIDERS.ANTHROPIC:
        await db
          .update(user)
          .set({ anthropicApiKey: encryptedKey })
          .where(eq(user.id, userId));

        updated = true;

        break;
    }

    if (updated) {
      return "API key updated successfully";
    } else {
      return "API key not updated";
    }
  } catch (error) {
    console.error(error);
    return "API key not updated";
  }
}

export async function getApiKeys(userId: string) {
  const result = await db.select().from(user).where(eq(user.id, userId));

  if (result.length > 0) {
    const userData = { ...result[0] };

    if (userData.openaiApiKey) {
      userData.openaiApiKey = decrypt(userData.openaiApiKey);
    }

    if (userData.openRouterApiKey) {
      userData.openRouterApiKey = decrypt(userData.openRouterApiKey);
    }

    if (userData.anthropicApiKey) {
      userData.anthropicApiKey = decrypt(userData.anthropicApiKey);
    }

    return [userData];
  }

  return result;
}
