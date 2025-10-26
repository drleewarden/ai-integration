import { Resend } from "resend";

const resend = new Resend("re_3QFECgMB_LaRMXcJ33kbdHJEEJJ4uz8Tm");

resend.emails.send({
  from: "onboarding@resend.dev",
  to: "drleewarden@gmail.com",
  subject: "Hello World",
  html: "<p>Congrats on sending your <strong>first email</strong>!</p>",
});
