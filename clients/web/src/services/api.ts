import { env } from "@/env";
import dayjs from "dayjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const apiFetch = async <T>(
  url: string,
  options?: RequestInit,
  responseType?: "json" | "direct",
): Promise<T> => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("better-auth.session_token");

  const response = await fetch(`${env.SERVER_URL}${url}`, {
    headers: {
      "Content-Type": "application/json",
      "X-User-Timezone": `${dayjs().format("YYYY-MM-DD HH:mm:ss Z")} ${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
      Cookie: `better-auth.session_token=${sessionCookie?.value ?? ""}`,
    },
    credentials: "include",
    ...options,
  });

  if (!response.ok) {
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
