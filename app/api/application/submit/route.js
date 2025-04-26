import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    console.log('Application submission started');
    const formData = await request.json();
    console.log('Received form data:', formData);
    
    // Check for required fields
    const requiredFields = ['characterName', 'realm', 'class', 'spec', 'ilvl', 'raidExperience', 'whyJoin', 'discordTag', 'favoriteColor'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      return new Response(JSON.stringify({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      }), { 
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Check if any raid days are selected
    if (!formData.availability || formData.availability.length === 0) {
      console.log('No availability days selected');
      return NextResponse.json(
        { success: false, error: "Please select at least one raid day" },
        { status: 400 }
      );
    }

    // Format the availability days into a readable string
    if (formData.availability && Array.isArray(formData.availability)) {
      formData.availabilityText = formData.availability.join(', ');
    } else {
      formData.availabilityText = "Not specified";
    }
    
    // Timestamp the application
    formData.submittedAt = new Date().toISOString();
    
    // Create application ID
    const applicationId = `RT-${Date.now().toString().slice(-6)}`;
    console.log('Generated application ID:', applicationId);
    
    // Format Discord webhook payload
    const discordPayload = {
      content: `**NEW GUILD APPLICATION**
      
**Character:** ${formData.characterName}-${formData.realm} (${formData.class} - ${formData.spec}, ilvl: ${formData.ilvl})
**Discord:** \`@${formData.discordTag}\` ← *Copy this to mention them*${formData.battleTag ? `\n**Battle.net:** ${formData.battleTag}` : ''}
**Available:** ${formData.availabilityText}

**Raid Experience:**
${formData.raidExperience}

**Why they want to join:**
${formData.whyJoin}

**Favorite Crayon Flavor:** ${formData.favoriteColor}

*Application ID: ${applicationId}*`,
      embeds: [
        {
          title: `📝 Application: ${formData.characterName}-${formData.realm}`,
          color: 16007990, // Red color in decimal
          fields: [
            {
              name: "Character Info",
              value: `**Name:** ${formData.characterName}\n**Realm:** ${formData.realm}\n**Class:** ${formData.class}\n**Spec:** ${formData.spec}\n**Item Level:** ${formData.ilvl}`,
              inline: true
            },
            {
              name: "Contact",
              value: `**Discord:** \`@${formData.discordTag}\`${formData.battleTag ? `\n**Battle.net:** ${formData.battleTag}` : ''}`,
              inline: true
            },
            {
              name: "Availability",
              value: formData.availabilityText || "Not specified",
              inline: false
            },
            {
              name: "Raid Experience",
              value: formData.raidExperience || "None provided",
              inline: false
            },
            {
              name: "Why Join Raid Team",
              value: formData.whyJoin || "None provided",
              inline: false
            },
            {
              name: "🖍️ Favorite Crayon Flavor",
              value: formData.favoriteColor || "None provided",
              inline: false
            }
          ],
          timestamp: formData.submittedAt,
          footer: {
            text: `Application ID: ${applicationId}`
          }
        }
      ]
    };
    
    // Discord webhook URL
    let discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
    
    // If environment variable isn't available, use hardcoded fallback
    if (!discordWebhookUrl) {
      console.warn('Environment variable DISCORD_WEBHOOK_URL not found, using hardcoded fallback');
      discordWebhookUrl = 'https://discord.com/api/webhooks/1365762075749515304/GF4Zfg96z1Rclimg7GkCcqVuZ6s3DJLZZUXGatXsndzTacMmC2QO40Z0OPTAVNOMuK1S';
    }
    
    console.log('Discord webhook URL:', discordWebhookUrl ? 'URL is set (not shown for security)' : 'URL is not set');
    
    // Send to Discord
    try {
      console.log('Sending to Discord webhook...');
      
      const discordResponse = await fetch(discordWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(discordPayload),
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      console.log('Discord response status:', discordResponse.status);
      
      if (!discordResponse.ok) {
        const errorText = await discordResponse.text();
        console.error('Failed to send to Discord:', errorText);
        // Continue even if Discord fails, so the user still gets confirmation
      } else {
        console.log('Application successfully sent to Discord');
      }
    } catch (webhookError) {
      console.error('Error sending to Discord webhook:', webhookError.message);
      // Log the full error stack for debugging
      console.error(webhookError);
      // Continue with the response even if Discord webhook fails
    }
    
    // Return success response
    return NextResponse.json(
      { 
        success: true,
        message: "Application submitted successfully",
        applicationId: applicationId
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Application submission error:', error);
    
    return NextResponse.json(
      { success: false, error: "Failed to process application" },
      { status: 500 }
    );
  }
} 