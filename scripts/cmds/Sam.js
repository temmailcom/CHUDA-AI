module.exports.config = {
    name: "sam",
    version: "1.1.0",
    hasPermssion: 0,
    credits: "User",
    description: "No-prefix command to send and reply to Sam with additional responses",
    commandCategory: "Chat",
    usages: "",
    cooldowns: 5,
    dependencies: {}
};

module.exports.handleEvent = function({ api, event }) {
    const { body, threadID, messageID } = event;

    if (!body) return;

    const message = body.toLowerCase();

    // Respond to "Sam" with different messages
    if (message.includes("sam")) {
        // Reply in the current chat
        api.sendMessage("Sam akta bokachoda", threadID, messageID);

        // Send a message to Sam (optional, uncomment if needed)
        // const samUserID = "61559343691694";  // Replace with Sam's actual user ID
        // api.sendMessage("Sam bokachoda akta", samUserID);
    }
};

module.exports.run = async function({ api, event, args }) {
    // This function will not be called since this is a no-prefix command
};
