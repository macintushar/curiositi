export type NavLink = {
  href: string;
  label: string;
  isExternal: boolean;
};

export type ProfileLinkGroup = {
  links: {
    url: string;
    icon: React.ReactNode;
    label: string;
    isLinkExternal: boolean;
  }[];
};
