"use server";

import { env } from "@/env";

import dayjs from "dayjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const apiFetch = async <T>(
  url: string,
  options?: RequestInit,
  responseType?: "json" | "direct",
  additionalHeaders?: Record<string, string>,
): Promise<T> => {
  const cookieStore = (await cookies())
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const response = await fetch(`${env.SERVER_URL}${url}`, {
    headers: {
      "X-User-Timezone": `${dayjs().format("YYYY-MM-DD HH:mm:ss Z")} ${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
      Cookie: cookieStore,
      ...options?.headers,
      ...additionalHeaders,
    },
    credentials: "include",
    mode: "cors",
    body: options?.body,
    ...options,
  });

  if (!response.ok && response.status !== 400) {
    if (response.status === 401) {
      redirect("/sign-in");
    }

    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }

  if (responseType === "direct") {
    return response as unknown as T;
  }

  return (await response.json()) as T;
};
