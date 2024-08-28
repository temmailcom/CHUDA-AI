.cmd install approve.js const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "approve",
    version: "1.1",
    author: "YourName",
    role: 2, // Admin role or higher
    description: "Approve or reject groups for bot functionality, and view the list of pending groups.",
    category: "admin",
    guide: "{pn} [approve|reject|list] <groupID> <reason>\nExample: {pn} approve 1234567890 For bot access.\n{pn} list - View all groups pending approval."
  },

  onStart: async function ({ api, args, event, threadsData, role }) {
    if (role < 2) { // Only bot admins can use this command
      return api.sendMessage({
        body: "❌ | Only admins can use this command.",
      }, event.threadID);
    }

    const action = args[0] ? args[0].toLowerCase() : 'list';

    if (action === 'list') {
      return listPendingGroups(api, event.threadID, threadsData);
    }

    if (args.length < 2) {
      return api.sendMessage({
        body: "❌ | Missing arguments. Usage: {pn} [approve|reject] <groupID> <reason>\nExample: {pn} approve 1234567890 For bot access.",
      }, event.threadID);
    }

    const groupID = args[1];
    const reason = args.slice(2).join(" ") || "No reason provided";

    if (action !== "approve" && action !== "reject") {
      return api.sendMessage({
        body: "❌ | Invalid action. Use `approve`, `reject`, or `list`.\nExample: {pn} approve 1234567890 For bot access.",
      }, event.threadID);
    }

    try {
      // Ensure log directory exists
      const logDir = path.join(__dirname, 'logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir);
      }

      // Log command usage
      logCommandUsage(event.senderID, action, groupID, reason);

      // Save approval status
      if (action === "approve") {
        await threadsData.set(groupID, true, "approved");
        return api.sendMessage({
          body: `✅ | Group ${groupID} has been approved.\nReason: ${reason}`,
        }, event.threadID);
      } else if (action === "reject") {
        await threadsData.set(groupID, false, "approved");
        return api.sendMessage({
          body: `❌ | Group ${groupID} has been rejected.\nReason: ${reason}`,
        }, event.threadID);
      }

    } catch (error) {
      console.error("Error:", error);
      api.sendMessage({
        body: "❌ | An error occurred. Please try again later.\nError details: " + error.message,
      }, event.threadID);
    }
  },

  onChat: async function ({ event, api, threadsData, role }) {
    const isApproved = await threadsData.get(event.threadID, "approved");

    if (event.isGroup) {
      if (role < 2 && isApproved === false) {
        // Optionally, send a message or react when bot is added to an unapproved group
        return api.sendMessage({
          body: "❌ | This bot is not approved to operate in this group. Please contact an admin to approve the group.",
        }, event.threadID);
      }
    }
  }
};

// Function to log command usage
function logCommandUsage(userID, action, groupID, reason) {
  const logDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }

  const logMessage = `User ${userID} issued ${action} command on group ${groupID} with reason: ${reason}`;
  fs.appendFileSync(path.join(logDir, 'commandUsage.log'), `${new Date().toISOString()} - ${logMessage}\n`);
}

// Function to list pending groups
async function listPendingGroups(api, threadID, threadsData) {
  const allThreads = await threadsData.all("approved");
  const pendingGroups = Object.entries(allThreads)
    .filter(([_, approved]) => approved === false)
    .map(([groupID]) => groupID);

  if (pendingGroups.length === 0) {
    return api.sendMessage({
      body: "✅ | There are no pending groups awaiting approval.",
    }, threadID);
  }

  const pendingList = pendingGroups.join("\n");
  return api.sendMessage({
    body: `📋 | Pending groups awaiting approval:\n${pendingList}`,
  }, threadID);
}
