import {
  IconAlertCircle,
  IconFile,
  IconFileSearch,
  IconRefresh,
  IconSparkles,
  IconWorld,
  IconWorldSearch,
  type Icon as IconType,
} from "@tabler/icons-react";

import {
  MessageAction,
  MessageActions,
  MessageContent,
  Message,
} from "@/components/ui/message";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Icon } from "@/components/themes/logo/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import useChatStore from "@/stores/useChatStore";

import ExportMessage from "./export-message";
import CopyButton from "../copy-button";
import Suggestions from "./suggestions";

import type { ThreadMessage } from "@/types";

function UserMessage({ message }: { message: string }) {
  return (
    <div className="w-full">
      <MessageContent
        className="text-brand font-serif text-4xl font-medium"
        markdown
      >
        {message}
      </MessageContent>
    </div>
  );
}

function SourceBadge({
  title,
  search,
  Icon,
}: {
  title: string;
  search: string[];
  Icon: IconType;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">{title}</p>
      <div className="flex flex-wrap gap-2">
        {search.map((s) => (
          <Badge variant="outline" key={s}>
            <Icon /> {s}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function AssistantMessage({ message }: { message: ThreadMessage }) {
  const { files, configs } = useChatStore();

  if (message.strategy === "error") {
    return (
      <Alert variant="destructive">
        <IconAlertCircle />
        <AlertTitle>
          {message.content.length > 0
            ? message.content
            : "There was an error generating the response from the LLM. Please try again."}
        </AlertTitle>
        <AlertDescription>{message.reasoning}</AlertDescription>
      </Alert>
    );
  }

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
      <div className="flex flex-col gap-3">
        <TabsContent value="answer">
          <MessageContent markdown>{message.content}</MessageContent>
        </TabsContent>
        <TabsContent value="sources">
          <div className="mt-2 flex w-full flex-col space-y-6">
            {message.reasoning && (
              <div className="text-muted-foreground flex flex-col">
                <div className="text-brand flex items-center gap-1">
                  <IconSparkles className="size-5 stroke-1" />
                  <p className="font-serif text-xl font-medium italic">
                    Reasoning
                  </p>
                </div>
                <div className="text-muted-foreground border-l-muted border-l-2 pl-4 text-sm">
                  {message.reasoning}
                </div>
              </div>
            )}
            {message.documentSearches &&
              message.documentSearches.length > 0 && (
                <SourceBadge
                  title="Documents:"
                  search={message.documentSearches}
                  Icon={IconFileSearch}
                />
              )}
            {message.webSearches && message.webSearches.length > 0 && (
              <SourceBadge
                title="Web:"
                search={message.webSearches}
                Icon={IconWorldSearch}
              />
            )}
            {message.specificFileContent &&
              message.specificFileContent.length > 0 && (
                <SourceBadge
                  title="Specific Files:"
                  search={message.specificFileContent.map(
                    (file) => files.find((f) => f.id === file)?.name ?? file,
                  )}
                  Icon={IconFile}
                />
              )}
          </div>
        </TabsContent>
        <MessageActions className="flex justify-between px-1">
          <MessageAction
            tooltip="Export this message as Markdown or Text"
            side="top"
            delayDuration={100}
          >
            <ExportMessage message={message.content} />
          </MessageAction>
          <MessageActions>
            {message.model && (
              <MessageAction
                tooltip={`Generated with ${configs?.providers.find((p) => p.name === message.provider)?.models.find((m) => m.model === message.model)?.name} by ${
                  configs?.providers.find((p) => p.name === message.provider)
                    ?.title
                }`}
                delayDuration={100}
              >
                <Button variant="ghost" className="rounded-md">
                  <IconSparkles className="size-5" />
                </Button>
              </MessageAction>
            )}
            <MessageAction tooltip="Copy" delayDuration={100}>
              <CopyButton text={message.content} />
            </MessageAction>
            <MessageAction tooltip="Rewrite" delayDuration={100}>
              <Button variant="ghost" className="rounded-md" disabled>
                <IconRefresh className="size-4" />
              </Button>
            </MessageAction>
          </MessageActions>
        </MessageActions>
      </div>
    </Tabs>
  );
}

type MessageContainerProps = {
  message: ThreadMessage;
  isLastMessage: boolean;
};

export default function MessageContainer({
  message,
  isLastMessage,
}: MessageContainerProps) {
  return (
    <Message className="flex flex-col gap-2">
      {message.role === "user" ? (
        <UserMessage message={message.content} />
      ) : (
        <AssistantMessage message={message} />
      )}
      <Separator orientation="horizontal" className="w-full" />
      {isLastMessage &&
        message.role === "assistant" &&
        message.followUpSuggestions && (
          <Suggestions suggestions={message.followUpSuggestions} />
        )}
    </Message>
  );
}
