import { IconRefresh, IconWorld } from "@tabler/icons-react";

import {
  MessageAction,
  MessageActions,
  MessageContent,
  Message,
} from "@/components/ui/message";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/themes/logo/logo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ThreadMessage } from "@/types";
import ExportMessage from "./export-message";
import CopyButton from "../copy-button";
import { Separator } from "@/components/ui/separator";

function UserMessage({ message }: { message: string }) {
  return (
    <div className="w-full">
      <MessageContent className="text-2xl font-medium" markdown>
        {message}
      </MessageContent>
    </div>
  );
}

function AssistantMessage({ message }: { message: string }) {
  return (
    <Tabs defaultValue="answer" className="w-full">
      <TabsList>
        <TabsTrigger value="answer">
          <Icon className="size-6" />
          <p className="text-muted-foreground text-sm font-light">Answer</p>
        </TabsTrigger>
        <TabsTrigger value="sources">
          <IconWorld className="text-muted-foreground size-4" />
          <p className="text-muted-foreground text-sm font-light">Sources</p>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="answer" className="flex flex-col gap-3">
        <MessageContent markdown>{message}</MessageContent>
        <MessageActions className="flex justify-between">
          <MessageAction tooltip="Export" delayDuration={100}>
            <ExportMessage message={message} />
          </MessageAction>
          <MessageActions>
            <MessageAction tooltip="Copy" delayDuration={100}>
              <CopyButton text={message} />
            </MessageAction>
            <MessageAction tooltip="Rewrite" delayDuration={100}>
              <Button variant="ghost" className="rounded-md">
                <IconRefresh className="size-4" />
              </Button>
            </MessageAction>
          </MessageActions>
        </MessageActions>
      </TabsContent>
    </Tabs>
  );
}

type MessageContainerProps = {
  message: ThreadMessage;
};

export default function MessageContainer({ message }: MessageContainerProps) {
  return (
    <Message className="flex flex-col gap-2">
      {message.role === "user" ? (
        <UserMessage message={message.content} />
      ) : (
        <AssistantMessage message={message.content} />
      )}
      <Separator orientation="horizontal" className="w-full" />
    </Message>
  );
}
