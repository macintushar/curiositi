"use server";

import dayjs from "dayjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "../env.js";

export const apiFetch = async <T>(
  url: string,
  options?: RequestInit,
  responseType?: "json" | "direct",
  additionalHeaders?: Record<string, string>,
): Promise<T> => {
  const cookie = await cookies();

  const response = await fetch(env.NEXT_PUBLIC_BASE_URL + "/server" + url, {
    headers: {
      "X-User-Timezone": `${dayjs().format("YYYY-MM-DD HH:mm:ss Z")} ${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
      Cookie: cookie
        .getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join("; "),
      ...options?.headers,
      ...additionalHeaders,
    },
    credentials: "include",
    mode: "cors",
    body: options?.body,
    ...options,
  });

  console.log("res", response);

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
