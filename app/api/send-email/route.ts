// File: app/api/send-email/route.js
// Create this file if you're using Next.js 13+ App Router

import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

interface ConsultationRequestBody {
  name: string;
  email: string;
  company?: string;
  message: string;
}

interface ResendEmailSendOptions {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  html: string;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body: ConsultationRequestBody = await request.json();
    const { name, email, company, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const data = await resend.emails.send({
      from: "AI Integration Labs <onboarding@resend.dev>",
      to: "drleewarden@gmail.com",
      replyTo: email,
      subject: `New Consultation Request from ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f9f9f9;
                border-radius: 10px;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 10px 10px 0 0;
                text-align: center;
              }
              .content {
                background: white;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .field {
                margin-bottom: 20px;
              }
              .label {
                font-weight: bold;
                color: #667eea;
                margin-bottom: 5px;
              }
              .value {
                padding: 10px;
                background-color: #f0f0f0;
                border-radius: 5px;
              }
              .message-box {
                background-color: #f8f9fa;
                padding: 15px;
                border-left: 4px solid #667eea;
                margin-top: 10px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎯 New Consultation Request</h1>
              </div>
              <div class="content">
                <div class="field">
                  <div class="label">👤 Name:</div>
                  <div class="value">${name}</div>
                </div>
                
                <div class="field">
                  <div class="label">📧 Email:</div>
                  <div class="value"><a href="mailto:${email}">${email}</a></div>
                </div>
                
                ${
                  company
                    ? `
                <div class="field">
                  <div class="label">🏢 Company:</div>
                  <div class="value">${company}</div>
                </div>
                `
                    : ""
                }
                
                <div class="field">
                  <div class="label">💬 Message:</div>
                  <div class="message-box">${message.replace(
                    /\n/g,
                    "<br>"
                  )}</div>
                </div>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                
                <p style="color: #666; font-size: 14px;">
                  This email was sent from the AI Integration Labs contact form.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    } as ResendEmailSendOptions);

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error sending email:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      { error: "Failed to send email", details: errorMessage },
      { status: 500 }
    );
  }
}
