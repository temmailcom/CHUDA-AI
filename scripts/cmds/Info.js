module.exports = {
  config: {
    name: "admin69",
    version: "4.0",
    countDown: 5,
    role: 0,
    description: {
      en: "Displays detailed and visually enhanced information about the bot owner, including a high-resolution profile picture and Facebook link, with futuristic features and advanced communication functions.",
    },
    category: "info",
    guide: {
      en: "{pn}admin69",
    },
  },

  // Default settings
  settings: {
    enableProfilePicture: true, // Toggle to enable/disable profile picture display
    enableFacebookLink: true, // Toggle to enable/disable Facebook link display
    enableBio: true, // Toggle to enable/disable bio display
    enableStatistics: true, // Toggle to enable/disable bot usage statistics
    enableLastLogin: true, // Toggle to enable/disable last login time display
    enableQuickContact: true, // Toggle to enable/disable quick contact links
    customMessage: "THANK YOU FOR USING THE BOT! 😊", // Custom message displayed after owner info
    displayStyle: "futuristic", // Can be set to 'futuristic', 'simple', or 'minimal'
  },

  langs: {
    en: {
      ownerInfoFuturistic: `
╔══════════════════════════════
║   🎭 𝗢𝗪𝗡𝗘𝗥 🎭    
║   ---------------------
║  🌟 𝗡𝗔𝗠𝗘
║     👻:𝗦𝗔𝗜𝗙  𝗛𝗜𝗠𝗨
║  🌟 𝗦𝗨𝗥𝗡𝗔𝗠𝗘
║      👻:𝗦𝗔𝗜𝗙      
║  🌟 𝗡𝗜𝗖𝗞𝗡𝗔𝗠𝗘
║      👻:𝗛𝗜𝗠𝗨     
║  🌟 𝗕𝗜𝗥𝗧𝗛𝗗𝗔𝗬
║      👻:𝟮𝟰-𝟬𝟰-𝟮𝟬**       
║  🌟 𝗧𝗔𝗧𝗧𝗢𝗢𝗦
║      👻:𝗡𝗢        
║  🌟 𝗥𝗘𝗟𝗔𝗧𝗜𝗢𝗡𝗦𝗛𝗜𝗣 𝗦𝗧𝗔𝗧𝗨𝗦
║      👻:𝗦𝗜𝗡𝗚𝗟𝗘 
║  🌟 𝗠𝗨𝗦𝗜𝗖 𝗢𝗥 𝗠𝗢𝗩𝗜𝗘𝗦
║      👻:𝗠𝗨𝗦𝗜𝗖
║  🌟 𝗟𝗢𝗡𝗚𝗘𝗦𝗧 𝗥𝗘𝗟𝗔𝗧𝗜𝗢𝗡𝗦𝗛𝗜𝗣
║      👻:𝗡𝗢 𝗛𝗔𝗩𝗘 
║  🌟 𝗜𝗡𝗩𝗢𝗟𝗩𝗘𝗗 𝗜𝗡 𝗔𝗡 𝗔𝗖𝗖𝗜𝗗𝗘𝗡𝗧
║      👻:𝗡𝗢
║  🌟 𝗕𝗔𝗡𝗞 𝗕𝗔𝗟𝗔𝗡𝗖𝗘 
║      👻:𝗠𝗜𝗗𝗗𝗟𝗘 𝗖𝗟𝗔𝗦𝗦
║  🌟 𝗕𝗟𝗢𝗢𝗗 𝗗𝗢𝗡𝗔𝗧𝗘𝗗
║      👻:𝗡𝗢
║  🌟 𝗙𝗔𝗩𝗢𝗨𝗥𝗜𝗧𝗘 𝗗𝗥𝗜𝗡𝗞
║      👻:𝗥𝗘𝗗 𝗕𝗨𝗟𝗟
║  🌟 𝗕𝗥𝗢𝗞𝗘𝗡 𝗛𝗘𝗔𝗥𝗧𝗦
║      👻:𝟬𝟬 
║  🔗 𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞: [𝗖𝗟𝗜𝗖𝗞 𝗛𝗘𝗥𝗘]
║(https://www.facebook.com/99.6T9.HIMU.6T9.1
║?mibextid=ZbWKwL) 
║   -----------------------------------   
║   [📧 CONTACT ADMIN]
║ (https://m.me/100066839859875)
╚══════════════════════════════
`,
      ownerInfoSimple: `
🎭 OWNER INFORMATION 🎭

🌟 NAME: [NAME]
🌟 NICKNAME: [NICKNAME]
🌟 BIRTHDAY: [BIRTHDAY]

🔗 FACEBOOK: [CLICK HERE](https://www.facebook.com/99.6T9.HIMU.6T9.1?mibextid=ZbWKwL)
      `,
    },
  },

  onStart: async function ({ api, event, getLang }) {
    const { threadID, messageID } = event;
    const settings = this.settings || {}; // Ensure settings are defined
    let ownerInfo;

    // Determine which display style to use
    switch (settings.displayStyle) {
      case "simple":
        ownerInfo = getLang("ownerInfoSimple");
        break;
      case "minimal":
        ownerInfo = "OWNER INFO: NAME: [NAME], NICKNAME: [NICKNAME]";
        break;
      default:
        ownerInfo = getLang("ownerInfoFuturistic");
    }

    // Fetch and attach profile picture if enabled
    let attachments = [];
    if (settings.enableProfilePicture) {
      // Use provided high-resolution profile picture link
      const profilePicUrl = `https://i.postimg.cc/63PcQ3wF/FB-IMG-1725044895397.jpg`;
      attachments.push(await global.utils.getStreamFromURL(profilePicUrl));
    }

    // Add custom message
    ownerInfo += `\n\n${settings.customMessage || ""}`;

    // Fetch additional information if settings enabled
    if (settings.enableLastLogin) {
      // Placeholder for last login time
      const lastLogin = "Not available"; // Replace with actual method or data
      ownerInfo = ownerInfo.replace("[LAST LOGIN TIME]", lastLogin);
    }

    if (settings.enableStatistics) {
      // Placeholder for usage stats
      const usageStats = "Not available"; // Replace with actual method or data
      ownerInfo = ownerInfo.replace("[USAGE STATS]", usageStats);
    }

    // Send message
    api.sendMessage(
      {
        body: ownerInfo,
        attachment: attachments.length > 0 ? attachments : undefined,
      },
      threadID,
      messageID
    );
  },
};
