import Section from "@/components/app/section";

export default function ModelsTab() {
  return (
    <div className="flex w-full flex-col gap-4">
      <Section className="h-fit space-y-6 p-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-medium">API Keys</h2>
          <p className="text-muted-foreground text-sm">
            Bring your own API keys to use with your models
          </p>
        </div>
        <div className="flex items-center gap-4"></div>
      </Section>
    </div>
  );
}
