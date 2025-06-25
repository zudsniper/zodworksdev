import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

interface RequestBody {
    name: string;
    email: string;
    message: string;
    "cf-turnstile-response": string;
}

export async function POST(request: NextRequest) {
    const body: RequestBody = await request.json();
    const resendApiKey = process.env.RESEND_API_KEY;

    // Determine if we're in development/localhost by checking the request origin or headers
    const origin = request.headers.get('origin') || '';
    const host = request.headers.get('host') || '';
    const isLocalhost = origin.includes('localhost') || host.includes('localhost') || 
                       origin.includes('127.0.0.1') || host.includes('127.0.0.1');

    // Use test secret key for localhost, production key for other domains
    const secretKey = isLocalhost 
        ? "1x0000000000000000000000000000000AA" // Test secret key that always passes
        : process.env.TURNSTILE_SECRET_KEY;

    if (!secretKey || !resendApiKey) {
        console.error("Cloudflare Turnstile or Resend API key is not set in environment variables.");
        return NextResponse.json({ success: false, message: "Server configuration error." }, { status: 500 });
    }

    const formData = new FormData();
    formData.append("secret", secretKey);
    formData.append("response", body["cf-turnstile-response"]);
    formData.append("remoteip", (request.headers.get("x-forwarded-for") ?? "127.0.0.1").split(",")[0]);

    // Debug logging for localhost
    if (isLocalhost) {
        console.log("DEBUG: Using test keys for localhost");
        console.log("DEBUG: Turnstile token received:", body["cf-turnstile-response"]);
    }

    try {
        const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();

        // Debug logging
        if (isLocalhost) {
            console.log("DEBUG: Turnstile verification response:", data);
        }

        if (data.success) {
            // The token is valid.
            try {
                const resend = new Resend(resendApiKey);
                await resend.emails.send({
                    from: 'contact@mail.zodworks.dev', 
                    to: 'hello@zodworks.dev',
                    cc: body.email,
                    subject: `New Contact Form Submission from ${body.name}`,
                    html: `<p>You have a new message from <strong>${body.name}</strong> (${body.email}):</p>
                           <div style="border-left: 2px solid #ccc; padding-left: 1em; margin-top: 1em;">
                             <p>${body.message.replace(/\n/g, "<br>")}</p>
                           </div>`
                });

                return NextResponse.json({ success: true, message: "Message sent successfully!" });

            } catch (emailError) {
                console.error("Error sending email with Resend:", emailError);
                return NextResponse.json({ success: false, message: "Verification successful, but failed to send email." }, { status: 500 });
            }
        } else {
            // The token is invalid.
            console.warn("Turnstile verification failed:", data["error-codes"]);
            return NextResponse.json({ success: false, message: "Invalid verification token." }, { status: 400 });
        }
    } catch (error) {
        console.error("Error during Turnstile verification:", error);
        return NextResponse.json({ success: false, message: "Error verifying token." }, { status: 500 });
    }
} 