import { use } from "react";

import ChatInput from "@/components/app/chat/chat-input";
import LogoLines from "@/components/app/logo-lines";

import { getConfigs } from "@/services/configs";
import { getUsersFiles } from "@/services/files";
import { getSpaces } from "@/services/spaces";
import GlobalError from "../global-error";

export default function AppPage() {
  const { data: files, error: filesError } = use(getUsersFiles());
  const { data: spaces, error: spacesError } = use(getSpaces());
  const { data: configs, error: configsError } = use(getConfigs());

  if (filesError || spacesError || configsError) {
    return (
      <GlobalError
        error={
          filesError || spacesError || configsError
            ? new Error(
                `Error: ${filesError?.message} ${spacesError?.message} ${configsError?.message}`,
              )
            : new Error("Unknown error occurred")
        }
        reset={() => void 0}
      />
    );
  }

  return (
    <div className="h-full max-h-full w-full overflow-auto">
      <div className="flex flex-col items-center gap-8">
        <div className="flex w-fit flex-col gap-12">
          <div className="text-primary flex w-full flex-col items-center gap-2">
            <LogoLines>
              <h1 className="w-sm text-center font-serif text-4xl">
                <span className="text-brand">
                  <span className="italic">Find</span> what you need,
                </span>{" "}
                <br />
                <span className="text-brand/40">
                  anything from <span className="italic">anywhere</span>.
                </span>
              </h1>
            </LogoLines>
          </div>
        </div>

        <ChatInput
          files={files?.data ?? null}
          spaces={spaces?.data?.map((space) => space.space) ?? null}
          configs={configs?.data ?? null}
        />
      </div>
    </div>
  );
}
