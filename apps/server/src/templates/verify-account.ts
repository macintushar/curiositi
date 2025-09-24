type VerifyAccountProps = {
  url: string;
  name: string;
  baseUrl: string;
};

export default function VerifyAccount({
  url,
  name,
  baseUrl,
}: VerifyAccountProps) {
  return `
 <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
  <head>
    <link rel="preload" as="image" href="${baseUrl}/logo.png" />
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
    <style>
      @font-face {
        font-family: 'Instrument Sans';
        font-style: normal;
        font-weight: 400;
        mso-font-alt: 'sans-serif';

      }

      * {
        font-family: 'Instrument Sans', sans-serif;
      }
    </style>
  </head>
  <body
    style="margin-left:auto;margin-right:auto;margin-top:auto;margin-bottom:auto;background-color:rgb(255,255,255);padding-left:0.5rem;padding-right:0.5rem">
    <!--$-->
    <div
      style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0"
      data-skip-in-text="true">
      Verify your curiositi account
    </div>
    <table
      border="0"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      align="center">
      <tbody>
        <tr>
          <td
            style="margin-left:auto;margin-right:auto;margin-top:auto;margin-bottom:auto;background-color:rgb(255,255,255);padding-left:0.5rem;padding-right:0.5rem">
            <table
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="margin-left:auto;margin-right:auto;margin-top:40px;margin-bottom:40px;max-width:465px;border-radius:0.25rem;border-width:1px;border-color:rgb(234,234,234);border-style:solid;padding:20px">
              <tbody>
                <tr style="width:100%">
                  <td>
                    <table
                      align="center"
                      width="100%"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation"
                      style="margin-top:32px">
                      <tbody>
                        <tr>
                          <td>
                            <img
                              alt="Curiositi logo"
                              height="25.5"
                              src="http://localhost:3040/logo.png"
                              style="margin-left:auto;margin-right:auto;margin-top:0px;margin-bottom:0px;display:block;outline:none;border:none;text-decoration:none"
                              width="138" />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <h1
                      style="margin-left:0px;margin-right:0px;margin-top:30px;margin-bottom:30px;padding:0px;text-align:center;font-weight:400;font-size:1.25rem;line-height:1.75rem;color:rgb(0,0,0)">
                      Verify your account
                    </h1>
                    <hr
                      style="width:100%;border:none;border-top:1px solid #eaeaea" />
                    <table
                      align="center"
                      width="100%"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation">
                      <tbody>
                        <tr>
                          <td>
                            <p
                              style="font-size:14px;line-height:24px;margin-top:16px;margin-bottom:16px">
                              Hi, ${name}
                            </p>
                            <p
                              style="font-size:14px;line-height:24px;margin-top:16px;margin-bottom:16px">
                              Welcome to Curiositi!
                            </p>
                            <p
                              style="font-size:14px;line-height:24px;margin-top:16px;margin-bottom:16px">
                              To verify your account, click the button below:
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
                                        >Verify your account</span
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
                              If you did not sign up for Curiositi, please
                              ignore this email.
                            </p>
                            <p
                              style="font-size:14px;line-height:24px;margin-top:16px;margin-bottom:16px">
                              Thanks, <br />
                              The curiositi team
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <hr
                      style="margin-left:0px;margin-right:0px;margin-top:26px;margin-bottom:26px;width:100%;border-width:1px;border-color:rgb(234,234,234);border-style:solid;border:none;border-top:1px solid #eaeaea" />
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
                            <p
                              style="color:rgb(107,114,128);font-size:0.75rem;line-height:1rem;margin-top:16px;margin-bottom:16px">
                              ©
                              <!-- -->2025<!-- -->
                              Curiositi. All rights reserved.
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
    <!--7--><!--/$-->
  </body>
</html>

`;
}
