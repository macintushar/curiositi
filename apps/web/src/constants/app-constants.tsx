import type { ProfileLinkGroup } from "@/types";
import {
  IconBook,
  IconBrandGithub,
  IconMessageReport,
  IconSettings,
  IconWorld,
} from "@tabler/icons-react";

export const ghURL = "https://github.com/macintushar/curiositi";
export const mcpURL = "https://modelcontextprotocol.io/introduction";
export const docsURL =
  env.NEXT_PUBLIC_BASE_URL !== "http://localhost:3040"
    ? "https://docs.curiositi.xyz"
    : "http://localhost:3035";

import CuriositiIcon from "@/assets/icon.svg";
import { env } from "@/env";

export const CURIOSITI_ICON = CuriositiIcon as unknown as string;

export const profileLinks: ProfileLinkGroup[] = [
  {
    links: [
      {
        url: "/app/settings",
        icon: <IconSettings className="size-4" />,
        label: "Settings",
        isLinkExternal: false,
      },
    ],
  },
  {
    links: [
      {
        url: docsURL,
        icon: <IconBook className="size-4" />,
        label: "Documentation",
        isLinkExternal: true,
      },
      {
        url: "/",
        icon: <IconWorld className="size-4" />,
        label: "Homepage",
        isLinkExternal: false,
      },
    ],
  },
  {
    links: [
      {
        url: ghURL,
        icon: <IconBrandGithub className="size-4" />,
        label: "GitHub",
        isLinkExternal: true,
      },
      {
        url: `${ghURL}/issues`,
        icon: <IconMessageReport className="size-4" />,
        label: "Support",
        isLinkExternal: true,
      },
    ],
  },
];
