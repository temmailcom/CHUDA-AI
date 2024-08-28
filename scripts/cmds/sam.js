const fs = require('fs');
const path = require('path');
const moment = require('moment');

module.exports.config = {
    name: "Sam",
    version: "3.0.0",
    hasPermssion: 0,
    credits: "User",
    description: "Advanced command with personalized, multi-language, and dynamic features.",
    commandCategory: "Chat",
    usages: "Sam",
    cooldowns: 5, // Default cooldown
    dependencies: {
        "moment": "" // For time-based greetings
    }
};

module.exports.run = async function({ api, event, Users, Threads }) {
    const { threadID, messageID, senderID } = event;

    // Get user and thread info
    const userName = await Users.getNameUser(senderID);
    const threadInfo = await Threads.getData(threadID);
    const isAdmin = threadInfo.adminIDs.some(admin => admin.id === senderID);

    // Dynamic cooldown based on user role
    const userCooldowns = global.client.cooldowns.get(senderID) || {};
    const now = Date.now();
    let dynamicCooldown = this.config.cooldowns;

    if (isAdmin) {
        dynamicCooldown = 0; // No cooldown for admins
    } else if (userName.includes("VIP")) {
        dynamicCooldown = 3; // Shorter cooldown for VIPs
    }

    if (userCooldowns[this.config.name] && (now - userCooldowns[this.config.name] < dynamicCooldown * 1000)) {
        const remainingTime = Math.ceil((dynamicCooldown * 1000 - (now - userCooldowns[this.config.name])) / 1000);
        return api.sendMessage(`Please wait ${remainingTime} more seconds before using this command again.`, threadID, messageID);
    }

    userCooldowns[this.config.name] = now;
    global.client.cooldowns.set(senderID, userCooldowns);

    // Personalized greeting based on time of day
    const currentHour = moment().hour();
    let timeGreeting = "";

    if (currentHour < 12) {
        timeGreeting = "Good morning";
    } else if (currentHour < 18) {
        timeGreeting = "Good afternoon";
    } else {
        timeGreeting = "Good evening";
    }

    // Multi-language support
    const languages = {
        en: "Sam re chude",
        bn: "স্যাম রে চুদে",
        hi: "सैम रे चू**",
    };

    // Choose the language based on user preference (default to English)
    const userLanguage = threadInfo.language || 'en';
    const responseText = languages[userLanguage] || languages['en'];

    // Custom response for specific users
    const specialUserID = "SPECIAL_USER_ID_HERE";  // Replace with the specific user ID
    let finalResponse = `${timeGreeting}, ${userName}! ${responseText}`;

    if (senderID === specialUserID) {
        finalResponse = `Oi [name], tora obostha ki?`.replace("[name]", userName);
    }

    // Log the command usage to a JSON file
    const logFile = path.join(__dirname, 'sam_command_log.json');
    let logData = [];

    if (fs.existsSync(logFile)) {
        logData = JSON.parse(fs.readFileSync(logFile, 'utf8'));
    }

    logData.push({
        userName: userName,
        userID: senderID,
        threadID: threadID,
        command: this.config.name,
        timestamp: new Date().toISOString()
    });

    fs.writeFileSync(logFile, JSON.stringify(logData, null, 2), 'utf8');

    // Audio response (optional)
    const audioPath = path.join(__dirname, 'audio/sam_response.mp3');
    const audioAttachment = fs.existsSync(audioPath) ? fs.createReadStream(audioPath) : null;

    const messageOptions = {
        body: finalResponse,
        attachment: audioAttachment
    };

    // Send the message
    api.sendMessage(messageOptions, threadID, messageID);

    // Reaction-based trigger
    const reactMessages = ["🔥", "😂", "😹"];
    const randomReact = reactMessages[Math.floor(Math.random() * reactMessages.length)];
    api.setMessageReaction(randomReact, messageID, (err) => {
        if (err) console.error("Error setting reaction:", err);
    });
};
