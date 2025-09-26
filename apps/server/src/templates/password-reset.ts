import BaseLayout from "./base-layout";

type PasswordResetProps = {
  url: string;
  name: string;
};

export default function PasswordReset({ url, name }: PasswordResetProps) {
  return BaseLayout({
    heading: "Reset your password",
    previewText: "Reset your password",
    children: `
  <p
    style="font-size:14px;line-height:24px;margin-top:16px;margin-bottom:16px">
    Hi, ${name}
  </p>
  <p
    style="font-size:14px;line-height:24px;margin-top:16px;margin-bottom:16px">
    We received a request to reset your curiositi
    password.
  </p>
  <p
    style="font-size:14px;line-height:24px;margin-top:16px;margin-bottom:16px">
    To reset your password, click the button below:
  </p>
  <table
    align="center"
    width="100%"
    border="0"
    cellpadding="0"
    cellspacing="0"
    role="presentation"
    style="display:flex;justify-content:center;align-items:center">
    <tbody>
      <tr>
        <td>
          <a
            href="${url}"
            style="border-radius:0.25rem;background-color:rgb(5,150,105);padding-left:20px;padding-right:20px;padding-top:12px;padding-bottom:12px;text-align:center;font-weight:600;font-size:12px;color:rgb(255,255,255);text-decoration-line:none;line-height:100%;text-decoration:none;display:inline-block;max-width:100%;mso-padding-alt:0px"
            target="_blank"
            ><span
              ><!--[if mso]><i style="mso-font-width:500%;mso-text-raise:18" hidden>&#8202;&#8202;</i><![endif]--></span
            ><span
              style="max-width:100%;display:inline-block;line-height:120%;mso-padding-alt:0px;mso-text-raise:9px"
              >Reset your password</span
            ><span
              ><!--[if mso]><i style="mso-font-width:500%" hidden>&#8202;&#8202;&#8203;</i><![endif]--></span
            ></a
          >
        </td>
      </tr>
    </tbody>
  </table>
  <p
    style="font-size:14px;line-height:24px;margin-top:16px;margin-bottom:16px">
    or copy and paste this URL into your browser:<!-- -->
    <a
      href="${url}"
      style="color:rgb(37,99,235);text-decoration-line:none"
      target="_blank"
      >${url}</a
    >
  </p>
  <p
    style="font-size:14px;line-height:24px;margin-top:16px;margin-bottom:16px">
    This link will expire in 1 hour.
  </p>
  <p
    style="font-size:14px;line-height:24px;margin-top:16px;margin-bottom:16px">
    If you did not request a password reset, please
    ignore this email.
  </p>
  <p
    style="font-size:14px;line-height:24px;margin-top:16px;margin-bottom:16px">
    Thanks, <br />
    The curiositi team
  </p>
`,
  });
}
