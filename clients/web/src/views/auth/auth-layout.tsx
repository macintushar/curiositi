import Image from "next/image";
import bg from "@/assets/images/auth-bg.png";

import Section from "@/components/app/section";
import LogoLines from "@/components/app/logo-lines";

export default function AuthLayout({
  children,
  description,
}: {
  children: React.ReactNode;
  description: string;
}) {
  return (
    <div className="flex h-screen max-h-screen min-h-screen flex-col gap-[16px] p-[16px]">
      <Section>
        <div className="flex h-full w-full">
          <div className="flex w-full flex-col px-6 md:px-10">
            <LogoLines description={description}>
              <h1 className="w-xs text-center font-serif text-4xl">
                <span className="text-brand">
                  <span className="italic">Curiositi</span> starts here,
                </span>{" "}
                <span className="text-brand/40">
                  knowledge never <span className="italic">ends</span>.
                </span>
              </h1>
            </LogoLines>
            <div className="flex h-fit flex-1 justify-center">
              <div className="h-fit w-full max-w-xs">{children}</div>
            </div>
          </div>
          <div className="relative hidden h-full w-6xl lg:block">
            <Image
              src={bg}
              className="h-full w-fit rounded-tr-lg rounded-br-lg object-cover"
              alt="Image"
              priority
            />
          </div>
        </div>
      </Section>
    </div>
  );
}
