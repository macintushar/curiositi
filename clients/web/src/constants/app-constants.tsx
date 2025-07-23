import type { ProfileLinkGroup } from "@/types";
import {
  IconBrandGithub,
  IconMessageReport,
  IconSettings,
} from "@tabler/icons-react";

export const ghURL = "https://github.com/macintushar/curiositi";
export const mcpURL = "https://modelcontextprotocol.io/introduction";

import CuriositiIcon from "@/assets/icon.svg";

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
