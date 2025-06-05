import MessageInput from "@/components/app/chat/message-input";
import LogoLines from "@/components/app/logo-lines";

export default function AppPage() {
  return (
    <div className="h-full max-h-full w-full overflow-auto">
      <div className="flex flex-col items-center gap-8">
        <div className="flex w-fit flex-col gap-12">
          <div className="text-primary flex w-full flex-col items-center gap-2">
            <LogoLines description="">
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
        <MessageInput />
      </div>
    </div>
  );
}
