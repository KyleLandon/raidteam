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
    
    // Format the data for Discord
    const discordPayload = {
      ...formData,
      // Add a formatted version specifically for Discord
      discordFormatted: {
        embeds: [
          {
            title: `New Guild Application: ${formData.characterName}-${formData.realm}`,
            color: 0xff5252, // Red color
            fields: [
              {
                name: "Character Info",
                value: `**Name:** ${formData.characterName}\n**Realm:** ${formData.realm}\n**Class:** ${formData.class}\n**Spec:** ${formData.spec}\n**Item Level:** ${formData.ilvl}`
              },
              {
                name: "Contact",
                value: `**Discord:** ${formData.discordTag}${formData.battleTag ? `\n**Battle.net:** ${formData.battleTag}` : ''}`
              },
              {
                name: "Availability",
                value: formData.availabilityText || "Not specified"
              },
              {
                name: "Raid Experience",
                value: formData.raidExperience || "None provided"
              },
              {
                name: "Why Join",
                value: formData.whyJoin || "None provided"
              },
              {
                name: "Favorite Crayon Flavor 🖍️",
                value: formData.favoriteColor || "None provided"
              }
            ],
            timestamp: formData.submittedAt,
            footer: {
              text: `Application ID: RT-${Date.now().toString().slice(-6)}`
            }
          }
        ]
      }
    };
    
    // For make.com integration, you can use their webhook
    const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL;
    
    if (makeWebhookUrl) {
      // Send to make.com
      try {
        const makeResponse = await fetch(makeWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(discordPayload),
        });
        
        if (!makeResponse.ok) {
          console.error('Failed to send to make.com:', await makeResponse.text());
        }
      } catch (makeError) {
        console.error('Error sending to make.com:', makeError);
        // Continue with the response even if make.com fails
      }
    } else {
      // Just log the data if no webhook is configured
      console.log('Application received:', discordPayload);
    }
    
    // Return success response
    return NextResponse.json(
      { 
        success: true,
        message: "Application submitted successfully",
        applicationId: `RT-${Date.now().toString().slice(-6)}` // Generate a simple ID
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