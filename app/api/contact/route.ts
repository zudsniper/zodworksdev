import { NextRequest, NextResponse } from "next/server";
// Developer note:
// Set the following optional env variables to enable Cloudflare Worker dashboard link buttons
// in the Discord notification for contact form submissions:
//   CF_ACCOUNT_ID            Cloudflare account id
//   CF_WORKER_NAME           Worker (service) name (e.g. wrangler.jsonc "name")
//   CF_WORKER_DASHBOARD_URL  (optional) explicit full dashboard URL override
// If CF_WORKER_DASHBOARD_URL not provided a URL is constructed using account + worker name.

interface RequestBody {
    name: string;
    email: string;
    message: string;
    businessName?: string;
    businessUrl?: string; 
    priority?: string;
    "cf-turnstile-response": string;
}

interface DiscordEmbed {
    title: string;
    color: number;
    fields: Array<{
        name: string;
        value: string;
        inline: boolean;
    }>;
    footer: {
        text: string;
    };
    timestamp: string;
}

export async function POST(request: NextRequest) {
    const body: RequestBody = await request.json();
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
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
    
    // Check if this is a bypass token (dev mode)
    const isBypassToken = body["cf-turnstile-response"] === "bypass-token";

    if (!secretKey && !isBypassToken) {
        console.error("Cloudflare Turnstile secret key is not set in environment variables.");
        return NextResponse.json({ success: false, message: "server configuration error." }, { status: 500 });
    }
    
    if (!resendApiKey) {
        console.error("Resend API key is not set in environment variables.");
        return NextResponse.json({ success: false, message: "email configuration error." }, { status: 500 });
    }

    const formData = new FormData();
    // secretKey is guaranteed when not bypass (guard above); bypass skips verification later
    formData.append("secret", secretKey || "");
    formData.append("response", body["cf-turnstile-response"]);
    formData.append("remoteip", (request.headers.get("x-forwarded-for") ?? "127.0.0.1").split(",")[0]);

    // Debug logging for localhost
    if (isLocalhost) {
        console.log("DEBUG: Using test keys for localhost");
        console.log("DEBUG: Turnstile token received:", body["cf-turnstile-response"]);
    }

    try {
        // Skip Turnstile verification for bypass tokens
        let verificationSuccess = isBypassToken;
        
        if (!isBypassToken) {
            const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            // Debug logging
            if (isLocalhost) {
                console.log("DEBUG: Turnstile verification response:", data);
            }
            
            verificationSuccess = data.success;
            
            if (!verificationSuccess) {
                console.warn("Turnstile verification failed:", data["error-codes"]);
                return NextResponse.json({ success: false, message: "Invalid verification token." }, { status: 400 });
            }
        }

        if (verificationSuccess) {
            // The token is valid.
            try {
                // Send Discord notification
                if (discordWebhookUrl) {
                    await sendDiscordNotification(body, discordWebhookUrl);
                }

                // Send email via Resend
                const { Resend } = await import('resend');
                const resend = new Resend(resendApiKey);
                
                const priorityLabel = body.priority || 'normal';
                const priorityEmoji = {
                    urgent: '🚨',
                    high: '⚠️',
                    normal: '🔵',
                    low: '⚪'
                }[priorityLabel] || '🔵';
                
                const emailHtml = `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">
                            ${priorityEmoji} new contact form submission
                        </h2>
                        
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 5px 0;"><strong>from:</strong> ${body.name}</p>
                            <p style="margin: 5px 0;"><strong>email:</strong> <a href="mailto:${body.email}">${body.email}</a></p>
                            ${body.businessName ? `<p style="margin: 5px 0;"><strong>business:</strong> ${body.businessName}</p>` : ''}
                            ${body.businessUrl ? `<p style="margin: 5px 0;"><strong>website:</strong> <a href="${body.businessUrl}">${body.businessUrl}</a></p>` : ''}
                            <p style="margin: 5px 0;"><strong>priority:</strong> ${priorityLabel}</p>
                            <p style="margin: 5px 0;"><strong>time:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}</p>
                        </div>
                        
                        <div style="background: #fff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                            <h3 style="color: #555; margin-top: 0;">inquiry:</h3>
                            <div style="white-space: pre-wrap; line-height: 1.6;">${body.message.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</div>
                        </div>
                        
                        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px;">
                            <p>sent from the contact form at zodworks.dev</p>
                            <p>reply directly to this email to respond to ${body.name}</p>
                        </div>
                    </div>`;
                
                await resend.emails.send({
                    from: 'contact@mail.zodworks.dev', 
                    to: 'hello@zodworks.dev',
                    replyTo: body.email,
                    subject: `[${priorityLabel}] contact form: ${body.name}`,
                    html: emailHtml,
                    text: `new contact form submission\n\nfrom: ${body.name}\nemail: ${body.email}\n${body.businessName ? `business: ${body.businessName}\n` : ''}${body.businessUrl ? `website: ${body.businessUrl}\n` : ''}priority: ${priorityLabel}\n\ninquiry:\n${body.message}\n\n---\nsent from zodworks.dev`
                });
                
                return NextResponse.json({ success: true, message: "message sent successfully!" });

            } catch (error) {
                console.error("error sending message:", error);
                return NextResponse.json({ success: false, message: "failed to send message. please try again." }, { status: 500 });
            }
        }
    } catch (error) {
        console.error("Error during Turnstile verification:", error);
        return NextResponse.json({ success: false, message: "Error verifying token." }, { status: 500 });
    }
}

async function sendDiscordNotification(data: RequestBody, webhookUrl: string) {
    const messagePreview = data.message.substring(0, 500) + 
        (data.message.length > 500 ? '...' : '');
    
    // Set color based on priority
    const priorityColors: Record<string, number> = {
        urgent: 0xff0000, // Red
        high: 0xff8800,   // Orange
        normal: 0x0088ff, // Blue
        low: 0x888888     // Gray
    };
    
    const priorityEmojis: Record<string, string> = {
        urgent: '🚨',
        high: '⚠️',
        normal: '🔵',
        low: '⚪'
    };
    
    const fields = [
        {
            name: '👤 from',
            value: `${data.name}`,
            inline: true
        },
        {
            name: '📧 email',
            value: data.email,
            inline: true
        },
        {
            name: `${priorityEmojis[data.priority || 'normal']} priority`,
            value: data.priority || 'normal',
            inline: true
        }
    ];
    
    // Add business fields if provided
    if (data.businessName) {
        fields.push({
            name: '🏢 business',
            value: data.businessName,
            inline: true
        });
    }
    
    if (data.businessUrl) {
        fields.push({
            name: '🔗 website',
            value: data.businessUrl,
            inline: true
        });
    }
    
    fields.push(
        {
            name: '🕐 time',
            value: new Date().toLocaleString('en-US', { 
                timeZone: 'America/Chicago',
                dateStyle: 'short',
                timeStyle: 'short'
            }),
            inline: true
        },
        {
            name: '💬 inquiry',
            value: messagePreview || 'no message content',
            inline: false
        }
    );
    
    // Add user ping if configured
    const adminUserId = process.env.DISCORD_ADMIN_USER_ID;
    const content = adminUserId ? `<@${adminUserId}>` : undefined;
    
    const payload: any = {
        content,
        embeds: [{
            title: '📬 new contact form submission',
            color: priorityColors[data.priority || 'normal'],
            fields,
            footer: { text: 'zodworks.dev contact form' },
            timestamp: new Date().toISOString()
        }]
    };

    // Developer convenience link buttons if env vars provided.
    // Supported env vars:
    //   CF_ACCOUNT_ID       -> your Cloudflare account id
    //   CF_WORKER_NAME      -> worker service name (e.g. from wrangler.jsonc "name")
    //   CF_WORKER_DASHBOARD_URL (optional explicit full URL override)
    const explicit = process.env.CF_WORKER_DASHBOARD_URL;
    const account = process.env.CF_ACCOUNT_ID;
    const worker = process.env.CF_WORKER_NAME;
    let dashboardUrl = explicit;
    if (!dashboardUrl && account && worker) {
        dashboardUrl = `https://dash.cloudflare.com/${account}/workers/services/view/${worker}`;
    }
    if (dashboardUrl) {
        const buttons: any[] = [
            { type: 2, style: 5, label: 'Cloudflare Worker', url: dashboardUrl }
        ];
        if (!explicit && account && worker) {
            buttons.push({
                type: 2,
                style: 5,
                label: 'Logs (tail)',
                url: `https://dash.cloudflare.com/${account}/workers/services/view/${worker}/production/monitoring`
            });
        }
        payload.components = [{ type: 1, components: buttons }];
    }
    
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            console.error('Discord webhook failed:', response.status, await response.text());
        }
    } catch (error) {
        console.error('Discord notification error:', error);
        // Don't throw - Discord notification failure shouldn't block email
    }
} 