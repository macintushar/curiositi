// Type declarations for Starlight virtual modules

declare module "virtual:starlight/components/SocialIcons" {
  const component: any;
  export default component;
}

declare module "virtual:starlight/components/Search" {
  const component: any;
  export default component;
}

declare module "virtual:starlight/components/ThemeSelect" {
  const component: any;
  export default component;
}

declare module "virtual:starlight/user-images" {
  export const logos: {
    light?: {
      src: string;
      alt?: string;
    };
    dark?: {
      src: string;
      alt?: string;
    };
  };
}

declare module "virtual:starlight/pagefind-config" {
  export const pagefindUserConfig: Record<string, any>;
}
