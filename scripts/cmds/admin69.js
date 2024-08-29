module.exports.config = {
    name: "owner",
    version: "7.0.0",
    hasPermssion: 0,
    credits: "User",
    description: "Provides the ultimate detailed information about the bot owner with interactive, personalized, and advanced features.",
    commandCategory: "info",
    usages: "",
    cooldowns: 5,
    dependencies: {}
};

module.exports.onStart = async function({ api, event, Users, global }) {
    console.log("Owner command is now active and ready to use.");
};

module.exports.run = async function({ api, event, Users, global, args }) {
    const ownerDetails = {
        name: "Owner: [Your Name]",
        email: "Email: [Your Email]",
        website: "Website: [Your Website]",
        contact: "Contact: [Your Contact Number]",
        location: "Location: [Your Location]",
        facebook: "Facebook: [Your Facebook Profile Link]",
        telegram: "Telegram: [Your Telegram Link]",
        avatar: "https://link-to-your-avatar-image.com/avatar.jpg", // Optional
        banner: "https://link-to-your-banner-image.com/banner.jpg", // Optional: Banner image
        video: "https://link-to-your-intro-video.com/intro.mp4", // Optional: Introductory video
        customMessage: "Welcome to our community! 🎉", // Customizable message
        timezone: "GMT+0" // Timezone for scheduling and display
    };

    // Dynamic greeting based on time of day
    const currentHour = new Date().getHours();
    let greeting;
    if (currentHour < 12) {
        greeting = "🌅 Good Morning";
    } else if (currentHour < 18) {
        greeting = "🌞 Good Afternoon";
    } else {
        greeting = "🌜 Good Evening";
    }

    // Fetch user info and role
    const userInfo = await Users.getData(event.senderID);
    const userName = userInfo.name || "User";
    const userRole = userInfo.role || "Member";

    // Role-based personalization
    let roleMessage;
    if (userRole === "Admin") {
        roleMessage = "🌟 We deeply appreciate your commitment and leadership!";
    } else if (userRole === "Moderator") {
        roleMessage = "🌟 Your moderation skills are invaluable to us!";
    } else {
        roleMessage = "🌟 Thanks for being a valued member of our community!";
    }

    // Log command usage
    console.log(`[${new Date().toISOString()}] 🌟 Owner command used by ${userName} (${event.senderID})`);

    // Construct the message with interactive elements and rich content
    const message = {
        body: `
࿇══━━━✥◈✥━━━══࿇
𝚃𝚑𝚒𝚜 𝚏𝚛𝚘𝚗𝚝 𝚊𝚍𝚍
🎉 **Owner Details:**
🌟 **Name:** ${ownerDetails.name}
📧 **Email:** ${ownerDetails.email}
🌐 **Website:** ${ownerDetails.website}
📱 **Contact:** ${ownerDetails.contact}
📍 **Location:** ${ownerDetails.location}
👤 **Facebook:** ${ownerDetails.facebook}
📲 **Telegram:** ${ownerDetails.telegram}

${greeting}, ${userName}!
${roleMessage}

${ownerDetails.customMessage}

If you have any issues or queries, feel free to reach out!

🔘 **Interactive Buttons:**
- [Contact Owner](https://your-contact-link.com)
- [Visit Website](https://your-website-link.com)
- [Feedback](https://your-feedback-link.com)
- [Help Center](https://your-help-center-link.com)
`,
        attachment: [
            ownerDetails.avatar ? await global.utils.getStreamFromURL(ownerDetails.avatar) : null,
            ownerDetails.banner ? await global.utils.getStreamFromURL(ownerDetails.banner) : null,
            ownerDetails.video ? { type: 'video', url: ownerDetails.video } : null
        ].filter(Boolean),
        buttons: [
            {
                type: "postback",
                title: "Contact Owner",
                payload: "CONTACT_OWNER"
            },
            {
                type: "web_url",
                title: "Visit Website",
                url: ownerDetails.website
            },
            {
                type: "postback",
                title: "More Info",
                payload: "MORE_INFO"
            },
            {
                type: "postback",
                title: "Feedback",
                payload: "GIVE_FEEDBACK"
            },
            {
                type: "postback",
                title: "Help",
                payload: "HELP"
            },
            {
                type: "postback",
                title: "Report Issue",
                payload: "REPORT_ISSUE"
            }
        ],
        quick_replies: [
            {
                content_type: "text",
                title: "Send a Message",
                payload: "SEND_MESSAGE"
            },
            {
                content_type: "text",
                title: "Get Help",
                payload: "GET_HELP"
            }
        ]
    };

    // Send the message and handle button interactions
    api.sendMessage(message, event.threadID, (error, info) => {
        if (error) return console.error(error);

        global.client.reactionHandles.set(info.messageID, {
            name: this.config.name,
            messageID: info.messageID,
            author: event.senderID,
            trigger: async ({ api, event }) => {
                if (event.reaction === '👍') {
                    api.sendMessage(`🌟 Hey ${ownerDetails.name}, ${userName} from ${event.threadName} wants to get in touch!`, ownerDetails.contact);
                    api.sendMessage("📩 I've notified the owner about your request.", info.messageID);
                }
            }
        });
    });

    // Handle button payloads and interactions
    global.client.on('message', async (msg) => {
        switch (msg.payload) {
            case 'CONTACT_OWNER':
                api.sendMessage(`📧 Feel free to reach out to ${ownerDetails.email} or contact them directly on Telegram: ${ownerDetails.telegram}`, event.threadID);
                break;
            case 'MORE_INFO':
                api.sendMessage(`ℹ️ For more information, please visit our [Website](https://your-website-link.com) or contact the owner directly.`, event.threadID);
                break;
            case 'GIVE_FEEDBACK':
                api.sendMessage(`📝 We appreciate your feedback! Please send your thoughts to ${ownerDetails.email}.`, event.threadID);
                break;
            case 'HELP':
                api.sendMessage(`🛠️ Need help? Visit our [Help Center](https://your-help-center-link.com) for assistance.`, event.threadID);
                break;
            case 'REPORT_ISSUE':
                api.sendMessage(`🚨 To report an issue, please provide details and send them to ${ownerDetails.email}.`, event.threadID);
                break;
            case 'SEND_MESSAGE':
                api.sendMessage(`✉️ Send your message directly to the owner or through [Contact Form](https://your-contact-link.com).`, event.threadID);
                break;
            case 'GET_HELP':
                api.sendMessage(`💡 For help, visit our [Help Center](https://your-help-center-link.com) or ask directly here.`, event.threadID);
                break;
            default:
                api.sendMessage(`⚠️ Unknown command. Please use the interactive buttons for available options.`, event.threadID);
                break;
        }
    });
};
