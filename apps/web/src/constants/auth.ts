// Cookie Domain for cross-subdomain sharing
export const COOKIE_DOMAIN =
  process.env.NODE_ENV === "production"
    ? ".curiositi.macintushar.xyz"
    : undefined;
