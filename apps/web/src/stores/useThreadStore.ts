import type { Thread, ThreadMessage } from "@/types";
import { create } from "zustand";

type ThreadStore = {
  threads: Thread[];
  messages: ThreadMessage[];
  setMessages: (messages: ThreadMessage[]) => void;
  setThreads: (threads: Thread[]) => void;
};

const useThreadStore = create<ThreadStore>((set) => ({
  messages: [],
  threads: [],
  setMessages: (messages) => set({ messages }),
  setThreads: (threads) => set({ threads }),
}));

export default useThreadStore;
