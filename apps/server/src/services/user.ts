import db from "@/db";
import { settings } from "@/db/schema";
import { LLM_PROVIDERS } from "@/types";
import { encrypt, decrypt } from "@/lib/crypto";
import { eq } from "drizzle-orm";
import { tryCatch } from "@/lib/try-catch";

export async function addOrUpdateApiKey(
  userId: string,
  provider: LLM_PROVIDERS,
  updateValue: { apiKey: string; url: string },
) {
  const updateKeyPromise = async () => {
    let updated = false;

    const encryptedKey = encrypt(updateValue.apiKey);

    switch (provider) {
      case LLM_PROVIDERS.OPENAI:
        await db
          .update(settings)
          .set({ openaiApiKey: encryptedKey })
          .where(eq(settings.userId, userId));

        updated = true;

        break;

      case LLM_PROVIDERS.OPENROUTER:
        await db
          .update(settings)
          .set({ openRouterApiKey: encryptedKey })
          .where(eq(settings.userId, userId));

        updated = true;

        break;

      case LLM_PROVIDERS.ANTHROPIC:
        await db
          .update(settings)
          .set({ anthropicApiKey: encryptedKey })
          .where(eq(settings.userId, userId));

        updated = true;

        break;
    }

    if (updated) {
      return "API key updated successfully";
    } else {
      return "API key not updated";
    }
  };

  const { data, error } = await tryCatch(updateKeyPromise());

  if (error) {
    console.error(error);
    return "API key not updated";
  }

  return data;
}

export async function getApiKeys(userId: string) {
  const result = await db
    .select()
    .from(settings)
    .where(eq(settings.userId, userId));

  if (result.length > 0) {
    const userData = { ...result[0] };

    if (userData.openaiApiKey) {
      userData.openaiApiKey = await decrypt(userData.openaiApiKey);
    }

    if (userData.openRouterApiKey) {
      userData.openRouterApiKey = await decrypt(userData.openRouterApiKey);
    }

    if (userData.anthropicApiKey) {
      userData.anthropicApiKey = await decrypt(userData.anthropicApiKey);
    }

    return [userData];
  }

  return result;
}
