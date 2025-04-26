import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.json();
    
    // Check for required fields
    const requiredFields = ['characterName', 'realm', 'class', 'spec', 'ilvl', 'raidExperience', 'whyJoin', 'discordTag', 'favoriteColor'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
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
    
    // Format Discord webhook payload
    const discordPayload = {
      content: `**NEW GUILD APPLICATION**
      
**Character:** ${formData.characterName}-${formData.realm} (${formData.class} - ${formData.spec}, ilvl: ${formData.ilvl})
**Discord:** ${formData.discordTag}${formData.battleTag ? `\n**Battle.net:** ${formData.battleTag}` : ''}
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
              value: `**Discord:** ${formData.discordTag}${formData.battleTag ? `\n**Battle.net:** ${formData.battleTag}` : ''}`,
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
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
    
    // Send to Discord
    try {
      const discordResponse = await fetch(discordWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(discordPayload),
      });
      
      if (!discordResponse.ok) {
        console.error('Failed to send to Discord:', await discordResponse.text());
        // Continue even if Discord fails, so the user still gets confirmation
      } else {
        console.log('Application successfully sent to Discord');
      }
    } catch (webhookError) {
      console.error('Error sending to Discord webhook:', webhookError);
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