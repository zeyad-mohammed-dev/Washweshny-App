export const verifyEmailTemplate = ({ firstName = 'User', otp = '12345' }) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Verify Your Email - Washweshny 👻</title>
    </head>

    <body style="margin:0; padding:0; background-color:#0f0f14; font-family:Arial, Helvetica, sans-serif;">

      <!-- ===== Main Wrapper ===== -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0f0f14; padding:40px 16px;">
        <tr>
          <td align="center">

            <!-- ===== Card ===== -->
            <table
              role="presentation"
              width="620"
              cellspacing="0"
              cellpadding="0"
              style="max-width:100%; background:#171821; border:1px solid #2a2c39; border-radius:28px; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,0.45);"
            >

              <!-- ===== HERO SECTION ===== -->
              <tr>
                <td
                  style="padding:50px 40px 42px; background:linear-gradient(135deg,#1f2230 0%, #171821 100%); text-align:center; position:relative; overflow:hidden;"
                >

                  <!-- floating emojis -->
                  <div style="font-size:22px; position:absolute; top:18px; left:26px; opacity:0.18;">
                    💬
                  </div>

                  <div style="font-size:18px; position:absolute; top:28px; right:34px; opacity:0.16;">
                    🤫
                  </div>

                  <div style="font-size:20px; position:absolute; bottom:22px; left:48px; opacity:0.14;">
                    ✉️
                  </div>

                  <!-- logo -->
                  <div style="font-size:64px; line-height:1; margin-bottom:14px;">
                    👻
                  </div>

                  <p
                    style="margin:0 0 8px; color:#8f93a9; font-size:12px; letter-spacing:4px; text-transform:uppercase; font-weight:700;"
                  >
                    WASHWESHNY
                  </p>

                  <h1
                    style="margin:0 0 14px; color:#ffffff; font-size:36px; line-height:1.3; font-weight:800;"
                  >
                    You're Almost In 👋
                  </h1>

                  <p
                    style="margin:0; color:#b5b8c8; font-size:15px; line-height:1.8; max-width:420px; margin-inline:auto;"
                  >
                    Verify your email and start receiving anonymous messages securely.
                  </p>

                </td>
              </tr>

              <!-- ===== CONTENT ===== -->
              <tr>
                <td style="padding:44px 40px;">

                  <!-- greeting -->
                  <p
                    style="margin:0 0 16px; color:#ffffff; font-size:20px; font-weight:700;"
                  >
                    Hey ${firstName} 👻
                  </p>

                  <p
                    style="margin:0 0 34px; color:#b5b8c8; font-size:15px; line-height:1.9;"
                  >
                    Thanks for joining
                    <span style="color:#ffffff; font-weight:700;">
                      Washweshny
                    </span>
                    — the anonymous messaging platform where your identity stays hidden and your messages stay protected 🔒
                  </p>

                  <!-- OTP CARD -->
                  <table
                    role="presentation"
                    width="100%"
                    cellspacing="0"
                    cellpadding="0"
                    style="margin-bottom:34px;"
                  >
                    <tr>
                      <td align="center">

                        <div
                          style="background:#0f1017; border:1px solid #2c3042; border-radius:24px; padding:34px 24px; max-width:360px;"
                        >

                          <p
                            style="margin:0 0 12px; color:#8f93a9; font-size:11px; text-transform:uppercase; letter-spacing:3px; font-weight:700;"
                          >
                            Your Verification Code
                          </p>

                          <div
                            style="font-size:48px; letter-spacing:12px; font-weight:900; color:#ffffff; font-family:'Courier New', monospace; line-height:1; margin-bottom:16px;"
                          >
                            ${otp}
                          </div>

                          <div
                            style="display:inline-block; background:#1d2233; color:#d8def3; border-radius:999px; padding:8px 14px; font-size:12px; font-weight:600;"
                          >
                            ⏳ Expires in 10 minutes
                          </div>

                        </div>

                      </td>
                    </tr>
                  </table>

                  <!-- FEATURES -->
                  <table
                    role="presentation"
                    width="100%"
                    cellspacing="0"
                    cellpadding="0"
                    style="margin-bottom:32px;"
                  >
                    <tr>

                      <td width="33.33%" valign="top" style="padding:0 6px;">
                        <div
                          style="background:#11131b; border:1px solid #262938; border-radius:18px; padding:18px 14px; text-align:center; min-height:110px;"
                        >
                          <div style="font-size:24px; margin-bottom:10px;">
                            🔒
                          </div>

                          <p
                            style="margin:0; color:#d5d8e6; font-size:13px; line-height:1.6;"
                          >
                            End-to-end message protection
                          </p>
                        </div>
                      </td>

                      <td width="33.33%" valign="top" style="padding:0 6px;">
                        <div
                          style="background:#11131b; border:1px solid #262938; border-radius:18px; padding:18px 14px; text-align:center; min-height:110px;"
                        >
                          <div style="font-size:24px; margin-bottom:10px;">
                            👤
                          </div>

                          <p
                            style="margin:0; color:#d5d8e6; font-size:13px; line-height:1.6;"
                          >
                            Anonymous senders stay hidden
                          </p>
                        </div>
                      </td>

                      <td width="33.33%" valign="top" style="padding:0 6px;">
                        <div
                          style="background:#11131b; border:1px solid #262938; border-radius:18px; padding:18px 14px; text-align:center; min-height:110px;"
                        >
                          <div style="font-size:24px; margin-bottom:10px;">
                            📎
                          </div>

                          <p
                            style="margin:0; color:#d5d8e6; font-size:13px; line-height:1.6;"
                          >
                            Media & attachments support
                          </p>
                        </div>
                      </td>

                    </tr>
                  </table>

                  <!-- WARNING -->
                  <div
                    style="background:#1b1620; border:1px solid #3d3147; border-radius:16px; padding:18px 20px; margin-bottom:28px;"
                  >
                    <p
                      style="margin:0; color:#d7c9e6; font-size:13px; line-height:1.8;"
                    >
                      ⚠️ If you didn't create a Washweshny account,
                      you can safely ignore this email.
                    </p>
                  </div>

                  <!-- divider -->
                  <div
                    style="height:1px; background:#2b2d3a; margin-bottom:24px;"
                  ></div>

                  <!-- footer text -->
                  <p
                    style="margin:0; color:#8f93a9; font-size:13px; line-height:1.8; text-align:center;"
                  >
                    Sending anonymous vibes 👻 from the Washweshny Team
                  </p>

                </td>
              </tr>

              <!-- ===== FOOTER ===== -->
              <tr>
                <td
                  style="background:#101117; border-top:1px solid #232533; padding:24px 32px; text-align:center;"
                >

                  <p
                    style="margin:0 0 10px; color:#c4c7d7; font-size:13px; font-weight:600;"
                  >
                    Washweshny 👻
                  </p>

                  <p
                    style="margin:0; color:#72768b; font-size:11px; line-height:1.7;"
                  >
                    This is an automated email. Please do not reply directly.
                  </p>

                </td>
              </tr>

            </table>

            <!-- bottom note -->
            <p
              style="margin:20px 0 0; color:#5f6377; font-size:11px; text-align:center;"
            >
              © ${new Date().getFullYear()} Washweshny — Anonymous messaging platform
            </p>

          </td>
        </tr>
      </table>

    </body>
    </html>
  `;
};
