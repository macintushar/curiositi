import { env } from "@/env";
import { cookies } from "next/headers";

export const apiFetch = async <T>(url: string): Promise<T> => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("better-auth.session_token");

  const response = await fetch(`${env.SERVER_URL}${url}`, {
    headers: {
      "Content-Type": "application/json",
      Cookie: `better-auth.session_token=${sessionCookie?.value ?? ""}`,
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }

  return (await response.json()) as T;
};
