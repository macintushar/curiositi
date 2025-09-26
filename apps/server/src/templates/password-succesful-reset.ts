import BaseLayout from "./base-layout";

type PasswordSuccessfullyResetProps = {
  name: string;
};

export default function PasswordSuccessfullyReset({
  name,
}: PasswordSuccessfullyResetProps) {
  return BaseLayout({
    heading: "Password successfully reset",
    previewText: "Password successfully reset",
    children: `
    <p
        style="font-size:14px;line-height:24px;margin-top:16px;margin-bottom:16px">
        Hi, ${name}
    </p>
    <p
        style="font-size:14px;line-height:24px;margin-top:16px;margin-bottom:16px">
        Your password has been successfully reset.
    </p>
    <p
        style="font-size:14px;line-height:24px;margin-top:16px;margin-bottom:16px">
        If you did not request a password reset, please
        contact curiositi support immediately.
    </p>
    <p
        style="font-size:14px;line-height:24px;margin-top:16px;margin-bottom:16px">
        Thanks, <br />
        The curiositi team
    </p>
  `,
  });
}
