import { UI_HOST } from "@/constants";

type BaseLayoutProps = {
  heading: string;
  previewText: string;
  children: string;
};

export default function BaseLayout({
  heading,
  previewText,
  children,
}: BaseLayoutProps) {
  const baseUrl = UI_HOST;
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
      ${previewText}
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
                              src="${baseUrl}/logo.png"
                              style="margin-left:auto;margin-right:auto;margin-top:0px;margin-bottom:0px;display:block;outline:none;border:none;text-decoration:none"
                              width="138" />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <h1
                      style="margin-left:0px;margin-right:0px;margin-top:30px;margin-bottom:30px;padding:0px;text-align:center;font-weight:400;font-size:1.25rem;line-height:1.75rem;color:rgb(0,0,0)">
                      ${heading}
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
                          <td>${children}</td>
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
