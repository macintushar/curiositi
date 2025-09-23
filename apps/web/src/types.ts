// Re-export shared types
export * from "@curiositi/share";

// Import the base type for extension
import type { ThreadMessage } from "@curiositi/share";

// Web-specific types that extend shared types
export type WebThreadMessage = ThreadMessage & {
  confidence: number; // Web-specific field
};
