module.exports.config = {
    name: "sessionManager",
    version: "1.0.0",
    description: "Manages and limits sessions to avoid Facebook restrictions.",
    commandCategory: "system",
    cooldowns: 0,
    permissions: ["100066839859875"] // Replace with your Facebook UID or add more UIDs as needed
};

const activeSessions = {};
const maxSessions = 1; // Set a limit to the number of concurrent sessions
const sessionTimeout = 15 * 60 * 1000; // 15 minutes session timeout

module.exports.run = async ({ api, event, args }) => {
    const sessionId = event.threadID;
    const currentTime = Date.now();
    const { senderID } = event;

    // Check if the user has permission
    if (!module.exports.config.permissions.includes(senderID)) {
        return api.sendMessage("You don't have permission to manage sessions.", sessionId);
    }

    // Check if there is an active session
    if (activeSessions[sessionId]) {
        // If the session is still within the allowed time, reject the new session creation
        if (currentTime - activeSessions[sessionId] < sessionTimeout) {
            return api.sendMessage("A session is already active. Please try again later.", sessionId);
        } else {
            // If the session has timed out, remove it
            delete activeSessions[sessionId];
        }
    }

    // If no active session, create a new session
    if (Object.keys(activeSessions).length < maxSessions) {
        activeSessions[sessionId] = currentTime;
        api.sendMessage("New session created successfully.", sessionId);

        // Handle the bot's main functionality here
        // For example, handling messages, commands, etc.
    } else {
        api.sendMessage("Maximum number of sessions reached. Please wait for an active session to close.", sessionId);
    }
};

// Function to clear out expired sessions (optional, based on your use case)
function clearExpiredSessions() {
    const currentTime = Date.now();
    for (const sessionId in activeSessions) {
        if (currentTime - activeSessions[sessionId] >= sessionTimeout) {
            delete activeSessions[sessionId];
        }
    }
    setTimeout(clearExpiredSessions, sessionTimeout);
}

// Start the session clearing loop
clearExpiredSessions();
