import { Resend } from "resend";
import { User } from "better-auth";

import { RESEND_API_KEY } from "@/constants";
import PasswordReset from "@/templates/password-reset";
import VerifyAccount from "@/templates/verify-account";
import PasswordSuccessfullyReset from "@/templates/password-succesful-reset";

const resend = new Resend(RESEND_API_KEY as string);

export async function sendEmail(to: string, subject: string, body: string) {
  const { data, error } = await resend.emails.send({
    from: "Curiositi <noreply@mailer.curiositi.xyz>",
    to,
    subject,
    html: body,
  });
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function sendVerificationEmail({
  user,
  url,
}: {
  user: User;
  url: string;
}) {
  await sendEmail(
    user.email,
    "Verify your Email | Curiositi",
    VerifyAccount({
      url,
      name: user.name || user.email,
    }),
  );
}

export async function sendResetPasswordEmail({
  user,
  url,
}: {
  user: User;
  url: string;
}) {
  await sendEmail(
    user.email,
    "Reset your Password | Curiositi",
    PasswordReset({
      url,
      name: user.name || user.email,
    }),
  );
}

export async function sendPasswordSuccessfullyResetEmail({
  user,
}: {
  user: User;
}) {
  await sendEmail(
    user.email,
    "Password successfully reset | Curiositi",
    PasswordSuccessfullyReset({
      name: user.name || user.email,
    }),
  );
}
