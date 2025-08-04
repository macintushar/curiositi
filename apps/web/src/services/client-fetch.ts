import { env } from "@/env";

export const clientApiFetch = async <T>(
  url: string,
  options?: RequestInit,
  responseType?: "json" | "direct",
): Promise<T> => {
  const response = await fetch(`${env.NEXT_PUBLIC_SERVER_URL}${url}`, {
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }

  if (responseType === "direct") {
    return response as unknown as T;
  }

  return (await response.json()) as T;
};
